import { useState, useEffect, useCallback } from 'react';
import { NotificationService, PushNotificationPayload } from '../services/notifications';

export function usePushNotifications(employeeId?: string, employeeName?: string) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSubscribers, setActiveSubscribers] = useState<Array<{ employeeId: string; employeeName: string; subscribedAt: string }>>([]);

  useEffect(() => {
    const supported = NotificationService.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(NotificationService.getPermission());

      if (employeeId) {
        const stored = localStorage.getItem(`autocrm_push_subscribed_${employeeId}`) === 'true';
        setIsSubscribed(stored && Notification.permission === 'granted');
      }

      // Check service worker subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub && Notification.permission === 'granted') {
            setIsSubscribed(true);
          }
        });
      }).catch(() => {
        // ignore in environments without SW support
      });
    }

    // Refresh subscriber list
    fetchSubscribers();
  }, [employeeId]);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/push/subscriptions');
      if (res.ok) {
        const data = await res.json();
        if (data.subscribers) {
          setActiveSubscribers(data.subscribers);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!employeeId) return { success: false, error: 'No active employee specified.' };
    setIsLoading(true);
    try {
      const result = await NotificationService.subscribe(employeeId, employeeName || 'Staff Member');
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
        await fetchSubscribers();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, employeeName, fetchSubscribers]);

  const unsubscribe = useCallback(async () => {
    if (!employeeId) return false;
    setIsLoading(true);
    try {
      const success = await NotificationService.unsubscribe(employeeId);
      if (success) {
        setIsSubscribed(false);
        await fetchSubscribers();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, fetchSubscribers]);

  const sendDARApprovalNotification = useCallback(
    async (payload: PushNotificationPayload) => {
      const res = await NotificationService.sendDARApprovalAlert(payload);
      return res;
    },
    []
  );

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    activeSubscribers,
    subscribe,
    unsubscribe,
    sendDARApprovalNotification,
    refreshSubscribers: fetchSubscribers,
  };
}
