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
  const key = path ? makeKey("POST", path, body) : null;

  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    () =>
      request<T>(path!, {
        method: "POST",
        body,
        ...(reqOverrides || {}),
      }),
    swrOptions
  );

  return { data, error, isLoading, mutate };
}
