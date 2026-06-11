const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const SESSION_STORAGE_KEY = "open-tenders-analytics-session";

export type AnalyticsEventPayload = {
  eventName: string;
  entityType?: string;
  entityId?: string;
  path?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
};

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return undefined;

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function trackAnalyticsEvent(
  payload: AnalyticsEventPayload,
  accessToken?: string,
) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    ...payload,
    sessionId: getAnalyticsSessionId(),
    path:
      payload.path ||
      `${window.location.pathname}${window.location.search || ""}`,
    referrer: payload.referrer ?? document.referrer,
  });

  void fetch(`${API_BASE}/analytics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the user flow.
  });
}
