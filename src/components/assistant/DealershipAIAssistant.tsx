import React, { useState, useRef, useEffect } from 'react';
import { 
  ShowroomConfig, 
  Employee 
} from '../../types/crm';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Search, 
  MapPin, 
  ExternalLink, 
  RefreshCw, 
  X, 
  ChevronDown, 
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingChunks?: any[];
  mode?: 'general' | 'search' | 'maps';
  isError?: boolean;
}

interface DealershipAIAssistantProps {
  config: ShowroomConfig;
  currentEmployee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export const DealershipAIAssistant: React.FC<DealershipAIAssistantProps> = ({
  config,
  currentEmployee,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      text: `Hello ${currentEmployee.name}! I am your AutoCRM Dealership Intelligence Copilot. How can I assist you with your ${currentEmployee.department} tasks, customer objections, DAR report drafting, competitor car comparisons, or locating nearby RTO/service hubs today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'general' | 'search' | 'maps'>('general');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    {
      label: 'Compare Car Specs',
      text: `Compare key specifications and safety features for ${config.brand} popular SUVs vs key competitors in India.`,
      mode: 'search' as const,
    },
    {
      label: 'Locate Nearest EV / RTO Hubs',
      text: `Find verified EV DC fast charging stations and authorized transport RTO test tracks near ${config.branchLocation}.`,
      mode: 'maps' as const,
    },
    {
      label: 'Draft Daily DAR Report',
      text: `Help me draft a professional DAR (Daily Activity Report) for a ${currentEmployee.designation} who completed 28 calls, 4 walk-ins, 2 test drives, and closed 1 confirmed booking today.`,
      mode: 'general' as const,
    },
    {
      label: 'Overcoming Price Objections',
      text: `Customer says our insurance quote is ₹15,000 higher than online portals. Provide polite, professional talking points explaining dealership zero-depreciation and cashless claims.`,
      mode: 'general' as const,
    },
  ];

  const handleSendMessage = async (textToSend?: string, overrideMode?: 'general' | 'search' | 'maps') => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const chosenMode = overrideMode || assistantMode;
    const userMsgId = `usr-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: chosenMode,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    // Prepare conversation history for multi-turn chat
    const historyPayload = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      // Optional browser geolocation for maps grounding
      let userLocation: { lat: number; lng: number } | undefined = undefined;
      if (chosenMode === 'maps' && 'geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        } catch {
          // fallback to default coordinates if user declines or times out
          userLocation = { lat: 28.5355, lng: 77.3910 };
        }
      }

      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          mode: chosenMode,
          userLocation,
          showroomContext: {
            brand: config.brand,
            showroomName: config.showroomName,
            branchLocation: config.branchLocation,
            dealershipCode: config.dealershipCode,
            employeeName: currentEmployee.name,
            designation: currentEmployee.designation,
            department: currentEmployee.department,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to get answer from AI.`);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks,
        mode: data.mode,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Gemini Assistant Error:', err);
      const errMsgText = err.message || 'Unable to connect to AI Assistant. Please check network connectivity.';
      setErrorMessage(errMsgText);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: `⚠️ Error: ${errMsgText}. You can retry or switch between General, Google Search, and Maps modes.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 no-print">
      <div className="w-full max-w-2xl h-[92vh] max-h-[720px] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-blue-950/60 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">AutoCRM AI Copilot</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounding in Google Search &amp; Maps for {config.brand} Dealerships
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Bar */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">Grounding Mode:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAssistantMode('general')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                assistantMode === 'general'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Dealership Copilot</span>
            </button>

            <button
              onClick={() => setAssistantMode('search')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                assistantMode === 'search'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
              title="Google Search Grounding for live automotive data"
            >
              <Search className="w-3.5 h-3.5 text-emerald-300" />
              <span>Google Search</span>
            </button>

            <button
              onClick={() => setAssistantMode('maps')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                assistantMode === 'maps'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
              title="Google Maps Grounding for places, RTO, and charging hubs"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-300" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Message Header tag */}
                {msg.role === 'model' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-300 font-bold mb-1.5 uppercase tracking-wider">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AutoCRM Copilot</span>
                    {msg.mode && (
                      <span className="text-slate-400 font-normal">({msg.mode})</span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounding Citations / Links (Google Maps & Google Search) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[11px] space-y-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                      <ExternalLink className="w-3 h-3" /> Grounded Verified Sources:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, idx) => {
                        const web = chunk.web;
                        const maps = chunk.maps;
                        if (web?.uri) {
                          return (
                            <a
                              key={idx}
                              href={web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-blue-400 hover:text-blue-300 hover:border-blue-500 truncate max-w-xs inline-flex items-center gap-1"
                            >
                              <span>{web.title || web.uri}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          );
                        }
                        if (maps?.uri) {
                          return (
                            <a
                              key={idx}
                              href={maps.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 hover:text-white truncate max-w-xs inline-flex items-center gap-1"
                            >
                              <MapPin className="w-2.5 h-2.5 text-purple-400" />
                              <span>{maps.title || 'Open in Google Maps'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                <span>
                  {assistantMode === 'maps'
                    ? 'Retrieving verified Google Maps locations...'
                    : assistantMode === 'search'
                    ? 'Searching real-time Google automotive web data...'
                    : 'AutoCRM Copilot thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts suggestions */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Quick Ask:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.text, qp.mode)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-blue-600 hover:text-white text-[11px] text-slate-300 border border-slate-700 whitespace-nowrap transition shrink-0 disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                assistantMode === 'maps'
                  ? 'Ask about places (e.g., nearest RTO center, EV chargers)...'
                  : assistantMode === 'search'
                  ? 'Ask web search (e.g., latest car price updates, road tax)...'
                  : 'Ask about DAR reports, sales objections, or customer scripts...'
              }
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
