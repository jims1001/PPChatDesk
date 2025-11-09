import { appConfig } from "@/net/lib/config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = any> {
  method?: HttpMethod;
  params?: Record<string, any>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  baseURL?: string;
}

// token & hash 获取函数
let _getToken: () => string | null = () => null;
let _getTokenHash: () => string | null = () => null;

/** 注册 token 和 hash 获取方法 */
export function setHttpTokenGetter(
  getToken: () => string | null,
  getTokenHash?: () => string | null
) {
  _getToken = getToken;
  if (getTokenHash) _getTokenHash = getTokenHash;
}

/** 内部安全获取：注册函数 > localStorage */
function resolveToken(): string | null {
  try {
    return _getToken ? _getToken() : localStorage.getItem("authorization");
  } catch {
    return null;
  }
}

function resolveTokenHash(): string | null {
  try {
    return _getTokenHash
      ? _getTokenHash()
      : localStorage.getItem("authorizationHash");
  } catch {
    return null;
  }
}

export async function request<TResp = any, TBody = any>(
  path: string,
  opts: RequestOptions<TBody> = {}
): Promise<TResp> {
  const {
    method = "GET",
    params,
    body,
    headers = {},
    signal,
    timeoutMs = appConfig.requestTimeoutMs,
    baseURL = appConfig.apiBaseURL,
  } = opts;

  const url =
    baseURL.replace(/\/$/, "") +
    "/" +
    path.replace(/^\//, "") +
    (params ? `?${new URLSearchParams(params as any)}` : "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  const token = resolveToken();
  const hash = resolveTokenHash();

  const isJsonBody =
    body &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    typeof body === "object";

  // ✅ 添加两个 header：authorization + authorizationHash
  const authHeaders: Record<string, string> = {};
  if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  if (hash) authHeaders["authorizationHash"] = hash;

  const res = await fetch(url, {
    method,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
      ...headers,
    },
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : isJsonBody
        ? JSON.stringify(body)
        : (body as any),
    credentials: "include",
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data as TResp;
}
