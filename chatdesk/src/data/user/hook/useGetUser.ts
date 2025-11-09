import { useGet } from "@/net/hook/useGet";
import type { SWRConfiguration } from "swr";
import type { User } from "../user";

export function useGetUser(
  params?: Record<string, any>,
  swrOptions?: SWRConfiguration<User>
) {
  return useGet<User>("/user", params, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: false,
    ...swrOptions,
  });
}
