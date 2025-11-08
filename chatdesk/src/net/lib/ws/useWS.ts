// src/hooks/useWS.ts
import { useEffect, useRef, useState, useCallback } from "react";

type UseWSConfig = {
  key: string;
  url: string;
  options?: {
    autoReconnect?: boolean;
    reconnectBaseDelay?: number;
    reconnectMaxDelay?: number;
  };
  parse?: (raw: string | ArrayBuffer | Blob) => any;
};

export function useWS<T = any>(config: UseWSConfig) {
  const { url, options, parse } = config;
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  // 建立连接
  useEffect(() => {
    let ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setReadyState(ws.readyState);
    };

    ws.onmessage = (evt) => {
      const raw = evt.data;
      const parsed = parse ? parse(raw) : raw;
      setData(parsed);
    };

    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
      // 简单自动重连
      if (options?.autoReconnect) {
        const delay = options.reconnectBaseDelay ?? 1000;
        setTimeout(() => {
          // 重新触发 effect
          setData(undefined);
        }, delay);
      }
    };

    ws.onerror = () => {
      // 简单处理
    };

    return () => {
      ws.close();
    };
    // 这里故意只依赖 url，真正项目要做更复杂的重连控制
  }, [url]);

  const send = useCallback((payload: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
  }, []);

  return {
    data,
    send,
    readyState,
  };
}
