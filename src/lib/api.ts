const TOKEN_KEY = "she-token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function apiBase() {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "";
  }
  return "http://localhost:4000";
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string>;
  constructor(message: string, status: number, code?: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type Opts = RequestInit & { json?: unknown };

function unwrap<T>(data: any, status: number): T {
  if (data && typeof data === "object" && "success" in data) {
    if (!data.success) {
      throw new ApiError(data.message || "Request failed", status, data.code, data.errors);
    }
    return data.data as T;
  }
  if (!status || status >= 400) {
    throw new ApiError(data?.error || data?.message || "Request failed", status);
  }
  return data as T;
}

export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...opts,
      headers,
      body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${apiBase() || "the API"}. Check your connection and VITE_API_URL.`,
      0,
    );
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (res.status === 401 && typeof window !== "undefined" && path !== "/api/auth/login") {
    setToken(null);
  }

  if (!res.ok && !(data && typeof data === "object" && "success" in data)) {
    throw new ApiError(
      data?.error || data?.message || res.statusText || "Request failed",
      res.status,
    );
  }
  return unwrap<T>(data, res.status);
}

export async function apiUpload<T = unknown>(path: string, form: FormData): Promise<T> {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${apiBase()}${path}`, { method: "POST", headers, body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data?.success) {
    throw new ApiError(data?.message || data?.error || "Upload failed", res.status);
  }
  return unwrap<T>(data, res.status);
}

export function fileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${apiBase()}${url}`;
}

export async function downloadDocument(id: string, filename = "document.pdf") {
  const res = await fetch(`${apiBase()}/api/documents/${id}/download`, {
    headers: { Authorization: `Bearer ${getToken() || ""}` },
  });
  if (!res.ok) throw new ApiError("Download failed", res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
