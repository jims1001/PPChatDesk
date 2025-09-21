import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import { request, type RequestOptions } from "@/net/lib/http";
import { makeKey } from "@/net/lib/key";
type MutMethod = "POST" | "PUT" | "PATCH" | "DELETE";
export interface MutationArgs<TBody> {
  path: string;
  method?: MutMethod;
  body?: TBody;
  params?: Record<string, any>;
  reqOverrides?: Omit<RequestOptions, "method" | "params" | "body">;
}

/**
 * 通用变更 Hook（POST/PUT/PATCH/DELETE）
 * 支持与 SWR 缓存协作（可在 onSuccess 中 mutate 相关 key）
 */
export function useMutation<TResp = any, TBody = any>(
  path: string,
  method: MutMethod = "POST",
  swrOptions?: SWRMutationConfiguration<TResp, any, string, MutationArgs<TBody>>
) {
  const key = makeKey(method, path);

  const mutationFn = async (
    _key: string,
    { arg }: { arg: MutationArgs<TBody> }
  ) => {
    const m = arg.method ?? method;
    return request<TResp, TBody>(arg.path, {
      method: m,
      body: arg.body,
      params: arg.params,
      ...(arg.reqOverrides || {}),
    });
  };

  const { trigger, isMutating, data, error, reset } = useSWRMutation<
    TResp,
    any,
    string,
    MutationArgs<TBody>
  >(key, mutationFn, swrOptions);

  return { trigger, isMutating, data, error, reset };
}

/** 乐观更新小工具：在本地改缓存 → 调 API → 成功保持/失败回滚 */
export async function optimisticMutate<T>(
  mutate: (key?: any, data?: any, shouldRevalidate?: boolean) => Promise<any>,
  key: string,
  updater: (prev: T | undefined) => T,
  apiCall: () => Promise<any>
) {
  let rollback: T | undefined;
  await mutate(
    key,
    (prev: T | undefined) => {
      rollback = prev;
      return updater(prev);
    },
    false
  );
  try {
    await apiCall();
    await mutate(key); // 真实拉取一次，确保与服务端一致
  } catch (e) {
    await mutate(key, rollback, false); // 回滚
    throw e;
  }
}
