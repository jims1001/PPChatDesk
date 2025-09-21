export type WSStatus = "connecting" | "open" | "closing" | "closed";
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

export interface WSOptions {
  /** Append auth headers as query params, e.g. token */
  params?: Record<string, string | number | boolean | undefined>;
  /** Optional subprotocols */
  protocols?: string | string[];
  /** Manual control of reconnects (default true) */
  autoReconnect?: boolean;
  /** Exponential backoff (ms) */
  reconnectBaseDelay?: number; // default 1000
  reconnectMaxDelay?: number; // default 15000
  /** Close codes that should NOT trigger reconnect */
  noReconnectCloseCodes?: number[]; // e.g. 1000 normal close
}

export interface WSEventEnvelope<T = JSONValue> {
  type: string;
  payload: T;
  /** optional channel/room/topic */
  channel?: string;
  /** server monotonic id for dedup if needed */
  id?: string | number;
}

export interface ConnectedPayload {
  type: number;
  gatewayId: string; // e.g. "gateway_01"
  connId: string; // e.g. "757593127820607488"
  sessionId: string; // e.g. "n:{gateway_01}:id:757593127820607488"
  meta: {
    node_id: string;
  };
}

export type MessageParser<T> = (raw: string | ArrayBuffer | Blob) => T;

export interface UseWSSubscriptionConfig<T> {
  /** Key for SWR cache, e.g. `ws:/chat/general` */
  key: string;
  /** Full WS URL, e.g. wss://example.com/ws */
  url: string;
  options?: WSOptions;
  /** Optional custom parser, default JSON.parse when text */
  parse?: MessageParser<T>;
  /** Called when socket opens */
  onOpen?: (ws: WebSocket) => void;
  /** Called when socket closes */
  onClose?: (ev: CloseEvent) => void;
  /** Called on error */
  onError?: (ev: Event) => void;
}

export interface SendOptions {
  /** stringify payload as JSON automatically */
  json?: boolean; // default true
}

export interface UseWSReturn<T> {
  /** status of the underlying socket */
  status: WSStatus;
  /** last message pushed from server */
  data?: T;
  /** last error occurred inside subscription */
  error?: Error;
  /** send data through the socket */
  send: (data: any, opts?: SendOptions) => boolean;
  /** Close socket gracefully */
  close: (code?: number, reason?: string) => void;
  /** Underlying WebSocket (read-only); may be undefined until open */
  socket?: WebSocket;
}

// src/lib/ws/url.ts
export function withQuery(url: string, params?: Record<string, any>) {
  if (!params) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

/**
 * 把 JSON（字符串或对象）转换为指定类型 T。
 * - options.map:    可选，对原始对象做一次映射/规范化（flat -> envelope 等）
 * - options.is:     可选，类型守卫，失败则抛错；不传则直接断言为 T
 */
export function parseAs<T>(
  input: unknown,
  options?: {
    map?: (raw: any) => any;
    is?: (v: any) => v is T;
  }
): T {
  const raw = typeof input === "string" ? JSON.parse(input) : input;
  const shaped = options?.map ? options.map(raw) : raw;
  if (options?.is && !options.is(shaped)) {
    throw new Error("parseAs: value does not satisfy the target type");
  }
  return shaped as T;
}
