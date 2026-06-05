const API_BASE = "http://4.224.186.213/evaluation-service";

export const PRIORITY_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export async function fetchNotifications(token, params = {}) {
  const url = new URL(`${API_BASE}/notifications`);
  if (params.limit) url.searchParams.set("limit", params.limit);
  if (params.page) url.searchParams.set("page", params.page);
  if (params.notification_type)
    url.searchParams.set("notification_type", params.notification_type);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.notifications || [];
}

export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const wa = PRIORITY_WEIGHT[a.Type] ?? 0;
    const wb = PRIORITY_WEIGHT[b.Type] ?? 0;
    if (wb !== wa) return wb - wa;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}

export function getTopN(notifications, n) {
  return sortByPriority(notifications).slice(0, n);
}