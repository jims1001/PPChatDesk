import { usePost } from "@/net/hook/usePost";

export function useGetChatHistory(
  filter: {
    conversationId: string;
    lastSeq?: number;
    limit?: number;
  } | null,
  swrOptions: any = {}
) {
  return usePost(filter ? "/chat/history" : null, filter || undefined, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...swrOptions,
  });
}
