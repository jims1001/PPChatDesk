import { usePost } from "@/net/hook/usePost";
import { useEffect, useRef } from "react";

export function useGetChatHistory(filter: any, swrOptions?: any) {
  // 控制第一次放行
  const allowFetchRef = useRef(false);

  const { data, mutate, error, isLoading } = usePost(
    filter ? "/chat/history" : null,
    filter || undefined,
    {
      // 不要自动各种再刷
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      // 👇 关键这一行：1s 内同 key 只会真正请求一次
      dedupingInterval: 1000,
      ...swrOptions,
    }
  );

  useEffect(() => {
    if (!filter) return;

    // 第一次 filter 来了：放行 + 手动刷
    if (!allowFetchRef.current) {
      allowFetchRef.current = true;
      mutate(); // 即使这里和上面几乎同时触发，请求也只会发一条
    } else {
      // 以后你也可以在这里决定要不要再刷
      // mutate();
    }
  }, [filter, mutate]);

  return { data, mutate, error, isLoading };
}
