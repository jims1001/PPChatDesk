// src/hooks/useWS.ts
import { useEffect, useRef, useState, useCallback } from "react";

type UseWSConfig = {
  key: string;
  url: string;
  options?: {
    autoReconnect?: boolean;
    // 起步延迟，默认 30s
    reconnectBaseDelay?: number;
    // 最大延迟，默认 120s
    reconnectMaxDelay?: number;
  };
  parse?: (raw: string | ArrayBuffer | Blob) => any;
};

export function useWS<T = any>(config: UseWSConfig) {
  const { key, url, options, parse } = config;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  // 解决 React 18 严格模式：第一次 cleanup 不清理真正的资源
  const hasMountedRef = useRef(false);
  const isFirstCleanupRef = useRef(true);

  const [data, setData] = useState<T | undefined>(undefined);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [isDelaying, setIsDelaying] = useState<boolean>(false);

  // 用 ref 保存，避免进依赖触发重连
  const isDelayingRef = useRef(false);

  const reconnectDelayRef = useRef<number>(
    options?.reconnectBaseDelay ?? 30_000
  );
  const maxDelay = options?.reconnectMaxDelay ?? 120_000;

  // 初始化 window 容器
  useEffect(() => {
    const w = window as any;
    if (!w.__WS_STATUS__) {
      w.__WS_STATUS__ = {};
    }
  }, []);

  // 同步状态到 window
  useEffect(() => {
    (window as any).__WS_STATUS__[key] = {
      readyState,
      isDelaying,
    };
  }, [key, readyState, isDelaying]);

  const connect = useCallback(() => {
    // 一旦开始连，就不是延迟状态
    isDelayingRef.current = false;
    setIsDelaying(false);

    // 清理旧连接
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setReadyState(ws.readyState);
      // 连上后把延迟重置为起始值（30s）
      reconnectDelayRef.current = options?.reconnectBaseDelay ?? 30_000;
    };

    ws.onmessage = (evt) => {
      const raw = evt.data;
      const parsed = parse ? parse(raw) : raw;
      setData(parsed);
    };

    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
      console.log("[useWS] 连接断开");

      if (options?.autoReconnect) {
        // 如果已经在等，就不要再排一个了
        if (isDelayingRef.current) return;

        const delay = reconnectDelayRef.current;
        console.warn(`[useWS] 连接断开，${delay}ms 后重连...`);

        isDelayingRef.current = true;
        setIsDelaying(true);

        reconnectTimerRef.current = window.setTimeout(() => {
          // 下次延迟 +30s，最多 120s
          const nextDelay = Math.min(
            reconnectDelayRef.current + 30_000,
            maxDelay
          );
          reconnectDelayRef.current = nextDelay;

          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      // 交给 onclose
    };
  }, [url, options, parse, maxDelay]);

  useEffect(() => {
    // 真正第一次挂载
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      connect();
    }

    return () => {
      console.log("[useWS] 卸载");
      // 第一次 cleanup 是 React 18 dev 的“探测”，我们不清理，让定时器能跑起来
      if (isFirstCleanupRef.current) {
        isFirstCleanupRef.current = false;
        return;
      }

      // 真卸载才清理
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const send = useCallback((payload: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
  }, []);

  return {
    data,
    send,
    readyState,
    isDelaying,
  };
}
