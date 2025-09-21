import { useRef, useMemo, useCallback } from "react";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";
import type {
  UseWSReturn,
  UseWSSubscriptionConfig,
  WSStatus,
} from "@/net/lib/ws/type";
import { Backoff } from "@/net/lib/ws/retry";
import { withQuery } from "@/net/lib/ws/url";

export function useWS<T = unknown>(
  config: UseWSSubscriptionConfig<T>
): UseWSReturn<T> {
  const { key, url, options, parse, onOpen, onClose, onError } = config;
  const autoReconnect = options?.autoReconnect ?? true;
  const backoff = useRef(
    new Backoff(
      options?.reconnectBaseDelay ?? 1000,
      options?.reconnectMaxDelay ?? 15000
    )
  );
  const socketRef = useRef<WebSocket>(null);
  const statusRef = useRef<WSStatus>("closed");

  const sub = useMemo(() => {
    const fullURL = withQuery(url, options?.params);
    return {
      key,
      subscribe: (key: string, { next }: SWRSubscriptionOptions<T>) => {
        console.debug(`[ws] subscribing to ${key}`);
        let closedByUser = false;
        let retryTimer: number | undefined;

        const openSocket = () => {
          statusRef.current = "connecting";
          const ws = new WebSocket(fullURL, options?.protocols);
          socketRef.current = ws;

          ws.onopen = () => {
            statusRef.current = "open";
            backoff.current.reset();
            onOpen?.(ws);
          };
          ws.onmessage = async (ev: MessageEvent) => {
            try {
              const payload = await decodeMessage<T>(ev.data, parse);
              next(null, payload);
            } catch (e: any) {
              next(e);
            }
          };
          ws.onerror = (ev) => {
            console.log("error", ev);
            onError?.(ev);
          };
          ws.onclose = (ev) => {
            statusRef.current = "closed";
            onClose?.(ev);
            if (
              !closedByUser &&
              autoReconnect &&
              !shouldSkipReconnect(ev.code, options?.noReconnectCloseCodes)
            ) {
              const delay = backoff.current.next();
              retryTimer = window.setTimeout(openSocket, delay);
            }
          };
        };

        openSocket();

        return () => {
          closedByUser = true;
          if (retryTimer !== undefined) window.clearTimeout(retryTimer);
          const ws = socketRef.current;
          if (
            ws &&
            (ws.readyState === WebSocket.OPEN ||
              ws.readyState === WebSocket.CONNECTING)
          ) {
            statusRef.current = "closing";
            ws.close(1000, "user closed");
          }
        };
      },
    };
  }, [key, url, JSON.stringify(options?.params), options?.protocols]);

  const { data, error } = useSWRSubscription<T>(sub.key, sub.subscribe);

  const send = useCallback((data: any, opts?: { json?: boolean }) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(opts?.json ?? true ? JSON.stringify(data) : data);
    return true;
  }, []);

  const close = useCallback((code?: number, reason?: string) => {
    const ws = socketRef.current;
    if (!ws) return;
    statusRef.current = "closing";
    ws.close(code, reason);
  }, []);

  return {
    status: statusRef.current,
    data,
    error:
      error instanceof Error
        ? error
        : error
        ? new Error(String(error))
        : undefined,
    send,
    close,
    socket: socketRef.current ?? undefined,
  };
}

async function decodeMessage<T>(
  raw: string | ArrayBuffer | Blob,
  parse?: (raw: any) => T
): Promise<T> {
  if (parse) return parse(raw);
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }
  if (raw instanceof Blob) {
    const text = await raw.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }
  if (raw instanceof ArrayBuffer) {
    const text = new TextDecoder().decode(raw);
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }
  return raw as unknown as T;
}

function shouldSkipReconnect(code: number, noReconnect?: number[]) {
  const list = new Set([1000, 1001, ...(noReconnect ?? [])]);
  return list.has(code);
}
