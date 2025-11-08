import { useEffect, useRef, useCallback, useState } from "react";
import type {
  UseWSReturn,
  UseWSSubscriptionConfig,
  WSStatus,
} from "@/net/lib/ws/type";
import { Backoff } from "@/net/lib/ws/retry";
import { withQuery } from "@/net/lib/ws/url";

export function useWS<T = unknown>(
  config: UseWSSubscriptionConfig<T>
): UseWSReturn<T> & { connect: () => void } {
  const { url, options, parse, onOpen, onClose, onError } = config;
  const autoReconnect = options?.autoReconnect ?? false;

  const socketRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<WSStatus>("closed");
  const [data, setData] = useState<T | undefined>(undefined);
  const [err, setErr] = useState<Error | undefined>(undefined);

  // 防止并发/重复连接
  const isConnectingRef = useRef(false);
  const closedByUserRef = useRef(false);
  const retryTimerRef = useRef<number | undefined>(undefined);

  const backoffRef = useRef(
    new Backoff(
      options?.reconnectBaseDelay ?? 1000,
      options?.reconnectMaxDelay ?? 15000
    )
  );

  const fullURL = withQuery(url, options?.params);

  // --- 真正的建立连接函数，返回给上层 ---
  // 新增：记录是否曾经真正连通过
  const hasConnectedRef = useRef(false);

  const connect = useCallback(() => {
    // 1) 已在连，别连
    if (isConnectingRef.current) return;

    // 2) 已经连着，也别连
    const existing = socketRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // 3) ✅ 如果你想“一辈子只连一次”，加这个
    if (hasConnectedRef.current) {
      // 已经连通过一次了，以后都不再连
      return;
    }

    isConnectingRef.current = true;
    closedByUserRef.current = false;
    statusRef.current = "connecting";

    const ws = new WebSocket(fullURL, options?.protocols);
    socketRef.current = ws;

    ws.onopen = () => {
      statusRef.current = "open";
      isConnectingRef.current = false;
      hasConnectedRef.current = true; // ✅ 记住：成功连通过了
      backoffRef.current.reset();
      onOpen?.(ws);
    };

    ws.onmessage = async (ev: MessageEvent) => {
      try {
        const payload = await decodeMessage<T>(ev.data, parse);
        setData(payload);
      } catch (e: any) {
        setErr(e instanceof Error ? e : new Error(String(e)));
      }
    };

    ws.onerror = (ev) => {
      onError?.(ev);
    };

    ws.onclose = (ev) => {
      statusRef.current = "closed";
      socketRef.current = null;
      isConnectingRef.current = false;
      onClose?.(ev);

      // 你已经注释掉自动重连了，就保持不重连
      // 如果以后又想重连，就把下面的注释打开，并且把 hasConnectedRef 这层判断挪到别的地方
    };
  }, [
    fullURL,
    options?.protocols,
    options?.noReconnectCloseCodes,
    autoReconnect,
    onOpen,
    onClose,
    onError,
    parse,
  ]);
  // 只做清理，不自动连接
  useEffect(() => {
    return () => {
      closedByUserRef.current = true;
      if (retryTimerRef.current !== undefined) {
        window.clearTimeout(retryTimerRef.current);
      }
      const ws = socketRef.current;
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        statusRef.current = "closing";
        ws.close(1000, "unmount");
      }
      socketRef.current = null;
      isConnectingRef.current = false;
    };
  }, []);

  const send = useCallback((data: any, opts?: { json?: boolean }) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(opts?.json ?? true ? JSON.stringify(data) : data);
    return true;
  }, []);

  const close = useCallback((code?: number, reason?: string) => {
    closedByUserRef.current = true;
    const ws = socketRef.current;
    if (!ws) return;
    statusRef.current = "closing";
    ws.close(code, reason);
    socketRef.current = null;
  }, []);

  return {
    status: statusRef.current,
    data,
    error: err,
    send,
    close,
    socket: socketRef.current ?? undefined,
    // ⭐ 上层手动调用
    connect,
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
