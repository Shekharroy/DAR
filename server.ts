import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

import webpush from 'web-push';

dotenv.config();

// VAPID keys for Web Push Notifications
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BH5FvtLIW0pNVrcJxYCMzeNqdVeVkCX3kK2rkWE9N1rGO5eQGx-ED4s8BftP9qVG7CkVQrQz-XCk_gffBQyXUFY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'glIvvyMpEf4h4RUetbOLMezHzozjzkXfiBG8zczAaQ8';
const VAPID_SUBJECT = 'mailto:dar-crm@dealership.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface PushSubscriptionRecord {
  employeeId: string;
  employeeName: string;
  subscription: webpush.PushSubscription;
  subscribedAt: string;
}

const pushSubscriptionsMap: Map<string, PushSubscriptionRecord> = new Map();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Google GenAI server-side client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Dealership AI Assistant & Copilot (Supports multi-turn chat, Search Grounding, and Maps Grounding)
app.post('/api/gemini/assistant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      message, 
      history = [], 
      mode = 'general', 
      userLocation,
      showroomContext 
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: 'A valid message string is required.' 
      });
      return;
    }

    const ai = getGenAIClient();

    const systemInstruction = `You are AutoCRM Dealership Intelligence Copilot, an AI advisor built specifically for automobile dealership and showroom professionals (Tata Motors, Mahindra, Maruti Suzuki, Hyundai, Honda, Skoda, BMW, Mercedes-Benz, Audi, Nissan, Porsche, Ferrari, etc.).
Your mission is to assist showroom personnel including:
- Sales Executives / Consultants (competitive car comparisons, specs, feature walkaround scripts, objection handling, closing tips)
- Service Advisors (job card troubleshooting, maintenance schedules, CSI improvement, warranty guidelines)
- General Managers (DAR performance analysis, target pacing, showroom efficiency metrics)
- Receptionists & CRE (customer hospitality, follow-up call scripts, footfall logging)
- EDP & Accounts (DMS sync workflows, margin money, bank loan reconciliations).
Current Showroom context: ${showroomContext ? JSON.stringify(showroomContext) : 'Standard Multi-Brand Dealership'}.
Always provide professional, structured, helpful answers. When sharing locations or web references, be precise.`;

    // 1. Google Maps Grounding Mode
    if (mode === 'maps') {
      const toolConfig = userLocation?.lat && userLocation?.lng
        ? {
            retrievalConfig: {
              latLng: {
                latitude: Number(userLocation.lat),
                longitude: Number(userLocation.lng),
              },
            },
          }
        : undefined;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }
        ],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig,
        },
      });

      const text = response.text || 'No response generated.';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        success: true,
        text,
        groundingChunks,
        mode: 'maps',
      });
      return;
    }

    // 2. Google Search Grounding Mode
    if (mode === 'search') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nSearch query and question: ${message}` }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'No response generated.';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        success: true,
        text,
        groundingChunks,
        mode: 'search',
      });
      return;
    }

    // 3. Multi-turn Chat Mode (General & Role assistance)
    // Convert incoming history into contents format or use generateContent with conversational contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Append prior dialogue turns
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text || '' }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'No response generated.';

    res.json({
      success: true,
      text,
      mode: 'general',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/assistant:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred while communicating with Gemini AI.',
    });
  }
});

// PUSH NOTIFICATION ROUTES FOR DAR APPROVAL UPDATES
app.get('/api/push/vapid-public-key', (_req: Request, res: Response) => {
  res.json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
});

app.post('/api/push/subscribe', (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, subscription } = req.body;
    if (!employeeId || !subscription || !subscription.endpoint) {
      res.status(400).json({ success: false, error: 'Employee ID and valid subscription object are required.' });
      return;
    }

    pushSubscriptionsMap.set(employeeId, {
      employeeId,
      employeeName: employeeName || 'Staff Member',
      subscription,
      subscribedAt: new Date().toISOString(),
    });

    console.log(`[Push] Staff ${employeeName} (${employeeId}) subscribed to push notifications.`);
    res.json({
      success: true,
      message: `Subscribed successfully for employee ${employeeId}`,
      totalActiveSubscribers: pushSubscriptionsMap.size,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/push/unsubscribe', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  if (employeeId && pushSubscriptionsMap.has(employeeId)) {
    pushSubscriptionsMap.delete(employeeId);
  }
  res.json({ success: true, totalActiveSubscribers: pushSubscriptionsMap.size });
});

app.get('/api/push/subscriptions', (_req: Request, res: Response) => {
  const list = Array.from(pushSubscriptionsMap.values()).map((s) => ({
    employeeId: s.employeeId,
    employeeName: s.employeeName,
    subscribedAt: s.subscribedAt,
  }));
  res.json({ success: true, subscribers: list, count: list.length });
});

app.post('/api/push/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employeeId, // specific employee ID or 'all'
      title,
      body,
      reportId,
      status, // 'Approved' | 'Revision Requested' | 'Pending'
      gmRemarks,
      senderName = 'General Manager',
    } = req.body;

    const payload = JSON.stringify({
      title: title || `DAR ${status || 'Status Update'}`,
      body:
        body ||
        (status === 'Approved'
          ? `DAR for ${new Date().toISOString().split('T')[0]} has been APPROVED by ${senderName}. Remarks: "${gmRemarks || 'Excellent work!'}"`
          : `DAR requires revisions by ${senderName}. Remarks: "${gmRemarks || 'Please review your counts'}"`),
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `dar-${reportId || Date.now()}`,
      url: '/?tab=dar',
      reportId,
      status: status || 'Approved',
      timestamp: Date.now(),
    });

    const targets: PushSubscriptionRecord[] = [];
    if (employeeId === 'all') {
      targets.push(...Array.from(pushSubscriptionsMap.values()));
    } else if (employeeId && pushSubscriptionsMap.has(employeeId)) {
      targets.push(pushSubscriptionsMap.get(employeeId)!);
    }

    let successCount = 0;
    const failures: Array<{ employeeId: string; error: string }> = [];

    for (const target of targets) {
      try {
        await webpush.sendNotification(target.subscription, payload);
        successCount++;
      } catch (pushErr: any) {
        console.error(`Failed to send push to ${target.employeeId}:`, pushErr.message);
        failures.push({ employeeId: target.employeeId, error: pushErr.message });
        // If expired or gone (410/404), clean up
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          pushSubscriptionsMap.delete(target.employeeId);
        }
      }
    }

    res.json({
      success: true,
      sentCount: successCount,
      targetCount: targets.length,
      failures,
      note: targets.length === 0 ? 'No active push subscriptions found for target. Main thread fallback will trigger.' : undefined,
    });
  } catch (err: any) {
    console.error('Error in /api/push/notify:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AutoCRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
