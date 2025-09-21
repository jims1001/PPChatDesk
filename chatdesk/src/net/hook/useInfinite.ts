import useSWRInfinite, { type SWRInfiniteConfiguration } from "swr/infinite";
import { request, type RequestOptions } from "@/net/lib/http";

/**
 * 分页/滚动加载 Hook（游标或页码皆可）
 * @param getPathByIndex 根据页索引返回 path 与 params
 * @param options SWR Infinite 配置
 * @param reqOverrides HTTP 请求覆盖项
 */
export function useInfinite<T = any>(
  getPathByIndex: (
    index: number,
    previousPageData: T | null
  ) => {
    path: string | null;
    params?: Record<string, any>;
  },
  options?: SWRInfiniteConfiguration<T, any>,
  reqOverrides?: Omit<RequestOptions, "method" | "params">
) {
  const getKey = (index: number, prev: T | null) => {
    const conf = getPathByIndex(index, prev);
    if (!conf || !conf.path) return null;
    const url = new URL(conf.path, "http://_dummy"); // 仅用于拼接 key
    return `GET:${url.pathname}:${JSON.stringify(conf.params || {})}`;
  };

  const swr = useSWRInfinite<T>(
    getKey,
    (_, index, prev) => {
      const conf = getPathByIndex(index, prev);
      if (!conf || !conf.path) return null as any;
      return request<T>(conf.path, {
        method: "GET",
        params: conf.params,
        ...(reqOverrides || {}),
      });
    },
    {
      revalidateFirstPage: false,
      parallel: true,
      ...options,
    }
  );

  return swr;
}
