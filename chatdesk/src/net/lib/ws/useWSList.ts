// hooks/useWSList.ts
import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { useWSConn } from "./context";

export interface UseWSListOptions<T> {
  listKey: string;
  reduce?: (prev: T[], incoming: T) => T[];
  max?: number;
}

export function useWSList<T = any>(opts: UseWSListOptions<T>) {
  const { listKey, reduce, max = 200 } = opts;

  // 👇 拿到的就是同一条 ws（里面有 data、send、readyState）
  const ws = useWSConn<T>();

  const { data: list, mutate: setList } = useSWR<T[]>(listKey, {
    fallbackData: [],
  });

  const lastDataRef = useRef<any>(Symbol("init"));

  useEffect(() => {
    // 所有组件看到的 ws.data 是同一份（同一条 ws 推过来的）
    if (ws.data === undefined) return;
    if (ws.data === lastDataRef.current) return;
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

  // 返回的 send 也是同一条 ws 的 send
  return { ...ws, list: list ?? [], clear };
}
