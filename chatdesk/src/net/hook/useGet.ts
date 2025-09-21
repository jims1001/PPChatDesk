import useSWR, { type SWRConfiguration } from "swr";
import { request, type RequestOptions } from "@/net/lib/http";
import { makeKey } from "@/net/lib/key";

/**
 * GET 查询 Hook
 * @param path  例如 '/api/users'
 * @param params 查询参数
 * @param swrOptions SWR 配置
 * @param reqOverrides 覆盖 http 选项（超时、header 等）
 */
export function useGet<T = any>(
  path: string | null,
  params?: Record<string, any>,
  swrOptions?: SWRConfiguration<T, any>,
  reqOverrides?: Omit<RequestOptions, "method" | "params">
) {
  const key = path ? makeKey("GET", path, params) : null;
  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    // 用完整 path+params 调用统一 request
    () => request<T>(path!, { method: "GET", params, ...(reqOverrides || {}) }),
    swrOptions
  );
  return { data, error, isLoading, mutate };
}
