import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { request, type RequestOptions } from "@/net/lib/http";
import { makeKey } from "@/net/lib/key";

export function usePost<T = any>(
  path: string | null,
  body?: Record<string, any>,
  swrOptions?: SWRConfiguration<T, any>,
  reqOverrides?: Omit<RequestOptions, "method" | "body">
) {
  // ✅ 当 path 为空 或 body 为 undefined/null 时，不请求
  const shouldFetch = path && body !== undefined && body !== null;
  const key = shouldFetch ? makeKey("POST", path!, body) : null;

  console.log("usePost", { path, body, shouldFetch, key });

  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    key
      ? () =>
          request<T>(path!, {
            method: "POST",
            body,
            ...(reqOverrides || {}),
          })
      : null, // ✅ key 为 null 时，fetcher 为 null -> 不执行请求
    swrOptions
  );

  return { data, error, isLoading, mutate };
}
