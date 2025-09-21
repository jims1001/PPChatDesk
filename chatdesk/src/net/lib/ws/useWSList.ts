import { useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
// 如果你仍保留 JSONValue 约束，可按你的 types.ts 调整
import type { JSONValue } from "@/net/lib/ws/type";
import { useWS } from "@/net/lib/ws/useWS";

export interface UseWSListOptions<T> {
  listKey: string;
  socket: Parameters<typeof useWS<T>>[0];
  reduce?: (prev: T[], newItem: T) => T[];
  max?: number;
}

/**
 * 将 push 进来的 ws.data 追加到 SWR 列表缓存中。
 * 关键修复点：使用 useEffect 监听 ws.data 变化后再 mutate，避免在 render 中 setState。
 */
export function useWSList<T = JSONValue>(opts: UseWSListOptions<T>) {
  const { listKey, socket, reduce, max = 200 } = opts;
  const { data: list, mutate: setList } = useSWR<T[]>(listKey, {
    fallbackData: [],
  });
  const ws = useWS<T>(socket);

  // 防止同一引用的 data 被重复处理（例如父组件重复渲染但 ws.data 未变化）
  const lastDataRef = useRef<any>(Symbol("init"));

  useEffect(() => {
    if (ws.data === undefined) return;
    if (ws.data === lastDataRef.current) return; // 已处理，跳过
    lastDataRef.current = ws.data;

    setList(
      (prev) => {
        const base = prev ?? [];
        const next = reduce
          ? reduce(base, ws.data as T)
          : [...base, ws.data as T];
        if (next.length > max) next.splice(0, next.length - max);
        return next;
      },
      { revalidate: false }
    );
  }, [ws.data, setList, reduce, max]);

  const clear = useCallback(
    () => setList([], { revalidate: false }),
    [setList]
  );

  return { ...ws, list: list ?? [], clear };
}
