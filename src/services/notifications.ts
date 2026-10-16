/**
 * Push Notification Service for Automotive CRM DAR Approval Updates
 */

export interface PushNotificationPayload {
  employeeId: string;
  employeeName?: string;
  reportId?: string;
  status: 'Approved' | 'Revision Requested' | 'Pending' | 'Broadcast';
  gmRemarks?: string;
  senderName?: string;
  title?: string;
  body?: string;
}

// Convert VAPID base64 public key to Uint8Array required by pushManager.subscribe
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationService = {
  /**
   * Check if push notifications are supported by this browser/device
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Current notification permission ('default' | 'granted' | 'denied')
   */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  /**
   * Fetch VAPID Public Key from backend
   */
  async getVapidPublicKey(): Promise<string> {
    try {
      const res = await fetch('/api/push/vapid-public-key');
      const data = await res.json();
      return (
        data.publicKey ||
        'BH5FvtLIW0pNVrcJxYCMzeNqdVeVkCX3kK2rkWE9N1rGO5eQGx-ED4s8BftP9qVG7CkVQrQz-XCk_gffBQyXUFY'
      );
    } catch {
      return 'BH5FvtLIW0pNVrcJxYCMzeNqdVeVkCX3kK2rkWE9N1rGO5eQGx-ED4s8BftP9qVG7CkVQrQz-XCk_gffBQyXUFY';
    }
  },

  /**
   * Subscribe the current staff member to push notifications
   */
  async subscribe(employeeId: string, employeeName: string): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Push notifications are not supported on this browser or platform.' };
    }

    try {
      // 1. Request Notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Notification permission was denied or dismissed.' };
      }

      // 2. Wait for service worker registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Check for existing subscription or create new
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey = await this.getVapidPublicKey();
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      }

      // 4. Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          subscription: subscription.toJSON(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save push subscription on the server.');
      }

      // Store local flag
      localStorage.setItem(`autocrm_push_subscribed_${employeeId}`, 'true');

      // Trigger native vibration confirmation
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      return { success: true, subscription };
    } catch (err: any) {
      console.error('[NotificationService] Subscribe failed:', err);
      return { success: false, error: err.message || 'Push subscription failed.' };
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(employeeId: string): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      localStorage.removeItem(`autocrm_push_subscribed_${employeeId}`);
      return true;
    } catch (err) {
      console.error('[NotificationService] Unsubscribe failed:', err);
      return false;
    }
  },

  /**
   * Send DAR Approval status update to staff member (triggered by Manager / GM)
   */
  async sendDARApprovalAlert(payload: PushNotificationPayload): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Send via backend push server
      const response = await fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // 2. Also dispatch directly to local ServiceWorker if active (instant main-thread feedback)
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_DAR_NOTIFICATION',
          title: payload.title || `DAR ${payload.status}: Status Update`,
          body: payload.body,
          reportId: payload.reportId,
          status: payload.status,
          gmRemarks: payload.gmRemarks,
        });
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        // Fallback standard notification
        const title = payload.title || `DAR ${payload.status}: Status Update`;
        const body =
          payload.body ||
          (payload.status === 'Approved'
            ? `Your DAR has been approved by GM. Remarks: "${payload.gmRemarks || 'Target exceeded'}"`
            : `DAR requires revisions. Remarks: "${payload.gmRemarks || 'Please review counts'}"`);

        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
        });
      }

      return {
        success: true,
        message:
          payload.status === 'Approved'
            ? 'Push notification dispatched! Staff member notified of DAR approval.'
            : 'Push notification sent! Staff alerted of required revisions.',
      };
    } catch (err: any) {
      console.error('[NotificationService] Dispatch error:', err);
      return { success: false, message: err.message || 'Failed to dispatch push notification.' };
    }
  },
};
