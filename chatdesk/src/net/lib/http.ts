// 统一 HTTP 请求封装：fetch + 超时 + 鉴权 + 错误统一化 + 查询参数序列化
// 你可以替换为 axios，但 SWR + fetch 足够轻量。

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = any> {
  method?: HttpMethod;
  params?: Record<string, any>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number; // 默认 15s
  baseURL?: string; // 可覆盖全局 baseURL
}

let _baseURL = "";
let _getToken: () => string | null = () => null;

/** 在应用启动处配置一次 */
export function setupHttp(config: {
  baseURL: string;
  getToken?: () => string | null;
}) {
  _baseURL = config.baseURL;
  if (config.getToken) _getToken = config.getToken;
}

function toQuery(params?: Record<string, any>) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => search.append(k, String(item)));
    } else if (typeof v === "object") {
      search.append(k, JSON.stringify(v));
    } else {
      search.append(k, String(v));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export class HttpError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any, message?: string) {
    super(message || `HttpError ${status}`);
    this.status = status;
    this.data = data;
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
    timeoutMs = 15000,
    baseURL,
  } = opts;

  const url =
    (baseURL ?? _baseURL).replace(/\/$/, "") +
    "/" +
    path.replace(/^\//, "") +
    toQuery(params);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  // 合并外部 signal（可选）
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(signal.reason));
  }

  const token = _getToken();
  const isJsonBody =
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob);

  const resp = await fetch(url, {
    method,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : isJsonBody
        ? JSON.stringify(body)
        : (body as any),
    signal: controller.signal,
    credentials: "include", // 如不需要跨域 cookie，可去掉
  }).finally(() => clearTimeout(timer));

  const contentType = resp.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // 204 无内容
  if (resp.status === 204) return undefined as unknown as TResp;

  const data = isJson ? await resp.json().catch(() => null) : await resp.text();

  if (!resp.ok) {
    // 统一抛出 HttpError，SWR 会在 onError 回调中收到
    throw new HttpError(resp.status, data, data?.message || resp.statusText);
  }

  return data as TResp;
}
