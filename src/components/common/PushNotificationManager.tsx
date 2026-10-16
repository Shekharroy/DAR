import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Employee, DARReport } from '../../types/crm';
import { Bell, BellRing, BellOff, Send, CheckCircle2, AlertCircle, Smartphone, Radio, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PushNotificationManagerProps {
  currentEmployee: Employee;
  isOpen: boolean;
  onClose: () => void;
  pendingDARReports?: DARReport[];
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  currentEmployee,
  isOpen,
  onClose,
  pendingDARReports = [],
}) => {
  const { showToast } = useToast();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    activeSubscribers,
    subscribe,
    unsubscribe,
    sendDARApprovalNotification,
  } = usePushNotifications(currentEmployee.id, currentEmployee.name);

  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const isManagerOrGM =
    currentEmployee.department === 'Management' ||
    currentEmployee.designation.includes('Manager') ||
    currentEmployee.designation.includes('GM');

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) {
        showToast('Push Notifications Disabled', 'info', 'You will no longer receive background DAR alerts.');
      }
    } else {
      const res = await subscribe();
      if (res.success) {
        showToast('Push Notifications Active', 'success', 'You will receive immediate alerts when DARs are approved or revised!');
      } else {
        showToast('Subscription Error', 'error', res.error || 'Could not enable push notifications.');
      }
    }
  };

  const handleSendTestNotification = async () => {
    setIsSending(true);
    try {
      const res = await sendDARApprovalNotification({
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        status: 'Approved',
        title: 'DAR Approved: Status Update',
        body: `Test Alert: Your Daily Activity Report for today has been Approved by GM with 5-Star Performance!`,
        gmRemarks: 'Target exceeded across all parameters. Excellent performance!',
        senderName: 'General Manager',
      });

      if (res.success) {
        showToast('Notification Dispatched', 'success', 'Push notification sent to your device!');
      } else {
        showToast('Dispatch Notice', 'info', res.message);
      }
    } catch (e: any) {
      showToast('Error', 'error', e.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await sendDARApprovalNotification({
        employeeId: selectedStaffId,
        status: 'Broadcast',
        title: 'Urgent Showroom DAR Notice',
        body: broadcastMessage.trim(),
        senderName: `${currentEmployee.name} (${currentEmployee.designation})`,
      });

      if (res.success) {
        showToast('Broadcast Sent', 'success', `DAR alert sent to ${selectedStaffId === 'all' ? 'all subscribed staff' : 'selected staff member'}.`);
        setBroadcastMessage('');
      } else {
        showToast('Notice', 'info', res.message);
      }
    } catch (e: any) {
      showToast('Send Error', 'error', e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Push Notifications &amp; DAR Alerts
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Service Worker
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time staff alerts for DAR approvals, hourly reports &amp; GM remarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Support status banner */}
          {!isSupported ? (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-amber-200 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-100">Push Notifications Unavailable</p>
                <p className="mt-0.5">
                  Your current browser does not support the Push API. On iOS, add this app to your Home Screen to enable Web Push.
                </p>
              </div>
            </div>
          ) : (
            /* Staff Subscription Status Card */
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isSubscribed
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-ping'
                        : 'bg-slate-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {isSubscribed ? 'Notifications Active' : 'Notifications Inactive'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {currentEmployee.name} ({currentEmployee.designation})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleToggleSubscription}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    isSubscribed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff className="w-3.5 h-3.5" /> Turn Off
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" /> Enable Push
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Permission:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    permission === 'granted'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : permission === 'denied'
                      ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  }`}
                >
                  {permission.toUpperCase()}
                </span>
              </div>

              {/* Test button */}
              {isSubscribed && (
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendTestNotification}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  Send Test DAR Approval Notification
                </button>
              )}
            </div>
          )}

          {/* MANAGER / GM SECTION: Broadcast and Review Notifications */}
          {isManagerOrGM && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">Manager DAR Broadcast Console</h4>
                </div>
                <span className="text-xs text-slate-400">
                  <strong className="text-emerald-400">{activeSubscribers.length}</strong> Staff Subscribed
                </span>
              </div>

              {/* Pending DARs banner */}
              {pendingDARReports.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between text-xs">
                  <span className="text-blue-200">
                    <strong>{pendingDARReports.length}</strong> Daily Reports awaiting your review today.
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                    Pending GM Action
                  </span>
                </div>
              )}

              {/* Broadcast form */}
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Send Notification To:
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">📢 All Dealership Staff ({activeSubscribers.length} devices)</option>
                    {activeSubscribers.map((s) => (
                      <option key={s.employeeId} value={s.employeeId}>
                        👤 {s.employeeName} ({s.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Alert Message / Instruction:
                  </label>
                  <textarea
                    rows={2}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g., Attention team: Submit today's DAR before 7:30 PM with test drive and booking totals!"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !broadcastMessage.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Urgent Staff Alert
                </button>
              </form>

              {/* Active Subscribers List */}
              {activeSubscribers.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">Connected Staff Devices:</p>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {activeSubscribers.map((sub) => (
                      <div
                        key={sub.employeeId}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 font-medium">{sub.employeeName}</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Subscribed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
