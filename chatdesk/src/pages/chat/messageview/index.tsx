import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import MessageList from "@/pages/chat/messageview/messageList";
import ReplyBox from "./replay";
import { createTextMessage } from "@/data/conversation/messae";
import { useWSList } from "@/net/lib/ws/useWSList";
import { useGetUser } from "@/data/user/hook/useGetUser";
import { useGetChatHistory } from "@/data/conversation/hook/useGetChatHistory";
import type { ChatMessage } from "@/data/conversation/chatMessage";
const PAGE_SIZE = 50;
const CONVERSATION_ID = "p2p:user_10001_user_10002";
export default function ChatWindow() {
    const ws = useWSList<any>({
        listKey: "chat-list",
        reduce: (prev, item) => [...prev, item],
    });

    const { data: user } = useGetUser(undefined);


    const [query, setQuery] = useState<{
        conversationId: string;
        lastSeq: number;
        limit: number;
    } | null>(null);

    useEffect(() => {
        if (user) {
            setQuery({
                conversationId: CONVERSATION_ID,
                lastSeq: 0,
                limit: PAGE_SIZE,
            });
        }
    }, [user]);


    const { data: msgData, isLoading } = useGetChatHistory(query, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
    });

    const serverMessages = useMemo(() => {
        if (!msgData?.list) return [];

        return msgData.list
            .slice()
            .sort((a: ChatMessage, b: ChatMessage) => a.seq_num - b.seq_num)
            .map((m: ChatMessage) => {
                // 判定消息方向：send_id 是否为当前用户
                const direction =
                    user && m.send_id === user.UserID ? "out" : "in";

                // 统一取文本内容（可能在 text_elem 或 content_text）
                const text =
                    m.text_elem?.content?.trim() ||
                    m.content_text?.trim() ||
                    "";

                return {
                    id: m.client_msg_id || m.server_msg_id || `${m.seq_num}`,
                    kind: "text",
                    direction,
                    text,
                    createdAt: m.create_time_ms || m.send_time_ms || Date.now(),
                    raw: m, // 可选保留原始消息体
                };
            });
    }, [msgData, user]);

    const [localMessages, setLocalMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!ws.list || ws.list.length === 0) return;

        const append = ws.list.map((item: any) => {
            return {
                id: item.client_msg_id || `ws-${Date.now()}`,
                kind: "text",
                direction: item.send_id === user?.UserID ? "out" : "in",
                text: item.text_elem?.content || item.content_text || "",
                createdAt: item.create_time_ms || Date.now(),
                raw: item,
            };
        });

        setLocalMessages((prev) => [...prev, ...append]);
    }, [ws.list, user]);

    const allMessages = useMemo(() => {
        return [...serverMessages, ...localMessages].sort(
            (a, b) => a.createdAt - b.createdAt
        );
    }, [serverMessages, localMessages]);

    const loadOlder = useCallback(() => {
        if (!msgData?.hasMore) return;
        setQuery((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lastSeq: msgData.lastSeq, // 接口返回的上一页 seq
            };
        });
    }, [msgData]);

    // ✅ 发送消息
    const onSend = useCallback(
        (html: string, plain: string) => {
            const text = (plain || html).trim();
            const m = {
                id: `local-${Date.now()}`,
                kind: "text",
                direction: "out",
                text,
                createdAt: Date.now(),
            };
            setLocalMessages((prev) => [...prev, m]);

            const msg = createTextMessage(html);
            ws.send?.(msg);
        },
        [ws]
    );

    const footer = useMemo(() => {
        if (isLoading) return "加载中...";
        if (!msgData) return "";
        return msgData.hasMore ? "" : "所有对话已加载 🎉";
    }, [isLoading, msgData]);

    return (
        <div className={styles.root}>
            <div className={styles.messages}>
                <MessageList
                    items={allMessages}
                    firstItemIndex={0}
                    hasMore={msgData?.hasMore ?? false}
                    loadingMore={isLoading}
                    onLoadOlder={loadOlder}
                    footerText={footer}
                />
            </div>

            <div className={styles.composerWrap}>
                <div style={{ maxWidth: 720, margin: "24px auto" }}>
                    <ReplyBox
                        onSend={(p) => {
                            onSend(p.html, p.text);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
