import { usePost } from "@/net/hook/usePost";
import type { ChatConversation } from "../conversation";

type ListConversationsReq = {
  page?: number;
  limit?: number;
};

export function useGetChatConversatin(
  body?: ListConversationsReq,
  swrOptions: any = {}
) {
  // 返回值类型就是 ChatConversation[]
  return usePost<ChatConversation[]>("/chat/conversation", body, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...swrOptions,
  });
}
