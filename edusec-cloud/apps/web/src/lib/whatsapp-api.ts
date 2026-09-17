const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let accessToken: string | null = null;

async function ensureAccessToken() {
  if (accessToken || typeof window === "undefined") return;
  const refreshToken = window.sessionStorage.getItem("bxbii.refreshToken");
  if (!refreshToken) return;

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  accessToken = data.accessToken;
  window.sessionStorage.setItem("bxbii.refreshToken", data.refreshToken);
}

async function request<T>(path: string, options: RequestInit = {}) {
  await ensureAccessToken();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with ${res.status}`);
  }
  return (await res.json()) as T;
}

export const whatsappApi = {
  status: () => request<{ configured: boolean }>("/cms/whatsapp/status"),
  send: (phone: string, message: string) =>
    request<{ success: boolean; messageId: string | null }>("/cms/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ phone, message }),
    }),
};
