import { type PropsWithChildren } from "react";
import useSWR, { SWRConfig } from "swr";
import { request, setupHttp } from "@/net/lib/http";

// 全局 SWR Provider：统一 fetcher、重试策略、去抖、错误处理等
export function SWRClientProvider({
  children,
  baseURL,
  getToken,
}: PropsWithChildren<{ baseURL: string; getToken?: () => string | null }>) {
  setupHttp({ baseURL, getToken });

  return (
    <SWRConfig
      value={{
        fetcher: (key: string) => request(key), // 只传绝对 key 时可直接用
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        dedupingInterval: 500, // 500ms 内相同 key 的请求只打一次
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        onError(err, key) {
          // 401/403 可在此做跳转或刷新 token
          if ((err as any)?.status === 401) {
            console.warn("Unauthorized. key=", key);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

// 可选：在组件里直接用绝对 URL 的简便封装
export function useSimpleGet<T = any>(path: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(path);
  return { data, error, isLoading, mutate };
}

