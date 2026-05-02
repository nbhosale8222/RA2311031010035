import { useState, useCallback } from "react";

export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

export type FetchParams = {
  page?: number;
  limit?: number;
  notification_type?: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (params?: FetchParams) => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/notifications";
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined)
          queryParams.append("page", params.page.toString());
        if (params.limit !== undefined)
          queryParams.append("limit", params.limit.toString());
        if (params.notification_type)
          queryParams.append("notification_type", params.notification_type);
        url += `?${queryParams.toString()}`;
      }

      const tokenMatch = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
      const authToken = tokenMatch ? tokenMatch[1] : null;

      const response = await fetch(url, {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { notifications, loading, error, fetchNotifications };
}

export function sortPriority(notifs: Notification[], limit: number) {
  const weights: Record<string, number> = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  const sorted = [...notifs].sort((a, b) => {
    const wA = weights[a.Type] || 0;
    const wB = weights[b.Type] || 0;

    if (wA !== wB) return wB - wA;

    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
  });

  return sorted.slice(0, limit);
}
