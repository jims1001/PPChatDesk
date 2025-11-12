import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import MessageList from "@/pages/chat/messageview/messageList";
import ReplyBox from "./replay";
import { createTextMessage } from "@/data/conversation/messae";
import { useWSList } from "@/net/lib/ws/useWSList";
import { useGetUser } from "@/data/user/hook/useGetUser";
import { useGetChatHistory } from "@/data/conversation/hook/useGetChatHistory";
import type { ChatMessage } from "@/data/conversation/chatMessage";
import { useLocation, useParams } from "react-router-dom";

const PAGE_SIZE = 10;
const CONVERSATION_ID = "p2p:user_10001_user_10002";

export default function ChatWindow() {
    // 实时 ws 消息
    const ws = useWSList<any>({
        listKey: "chat-list",
        reduce: (prev, item) => [...prev, item],
    });

    const location = useLocation();
    const fromUser = location.state?.fromUser;
    const refreshKey = (location.state as any)?.refreshKey;

    const { id = CONVERSATION_ID } = useParams();
    const { data: user } = useGetUser(undefined);

    // 查询条件
    const [query, setQuery] = useState<{
        conversationId: string;
        lastSeq: number;
        limit: number;
        refreshKey: string;
    } | null>(null);

    // 拉历史的 hook，给它 query
    const {
        data: msgData,
        mutate,
        isLoading,
    } = useGetChatHistory(query, {});

    /**
     * ① 当 user / id / refreshKey 变化时，重新设置查询条件
     *    这一步只负责“准备参数”，不直接请求
     */
    useEffect(() => {
        if (user && id) {
            setQuery({
                conversationId: id,
                lastSeq: 0,
                limit: PAGE_SIZE,
                refreshKey
            });
        }
    }, [user, id, refreshKey]);

    /**
     * ② 当 query 真正准备好后，再触发一次 mutate
     *    这样一次点击只会走一次真正的请求
     */
    useEffect(() => {

        // 强制刷新历史
        // mutate();
    }, [refreshKey]);

    // 把服务端消息结构化
    const serverMessages = useMemo(() => {
        if (!msgData) return [];

        return msgData
            .slice()
            .sort((a: ChatMessage, b: ChatMessage) => b.seq_num - a.seq_num)
            .map((m: ChatMessage) => {
                const direction = user && m.send_id === user.UserID ? "out" : "in";
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
                    raw: m,
                };
            });
    }, [msgData, user]);

    // 本地追加的 ws 消息
    const [localMessages, setLocalMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!ws.list || ws.list.length === 0) return;

        // 过滤只接收自己的（按你原来的逻辑）
        const append = ws.list
            .filter((item: any) => {
                const filter = item.type == 1 && item.from == fromUser;
                return filter;
            })
            .map((item: any) => {
                return {
                    id: item.client_msg_id || `ws-${Date.now()}`,
                    kind: "text",
                    direction: item.send_id === user?.UserID ? "out" : "in",
                    text:
                        item.payload.text_elem?.content ||
                        item.payload.content_text ||
                        item.payload.quoteElem?.text ||
                        "",
                    createdAt: item.create_time_ms || Date.now(),
                    raw: { ...item.payload, seq_num: item.payload.seq },
                };
            });

        setLocalMessages((prev) => {
            const existingSeqs = new Set(
                prev
                    .map((m) => m.raw?.seq_num)
                    .filter((s) => s !== undefined && s !== null)
            );

            const deduped = append.filter((m) => {
                const seq = m.raw?.seq_num;
                if (seq === undefined || seq === null) return true;
                return !existingSeqs.has(seq);
            });

            return [...prev, ...deduped];
        });
    }, [ws.list, user, fromUser]);

    // 合并本地 + 服务端消息，并按 seq/time 排序
    const allMessages = useMemo(() => {
        const merged = [...serverMessages, ...localMessages];
        return merged.sort((a: any, b: any) => {
            const sa = Number(a.raw?.seq_num ?? a.seq_num ?? 0);
            const sb = Number(b.raw?.seq_num ?? b.seq_num ?? 0);

            if (sa && sb && sa !== sb) {
                return sa - sb; // 从小到大
            }

            const ta = Number(a.createdAt ?? 0);
            const tb = Number(b.createdAt ?? 0);
            return ta - tb;
        });
    }, [serverMessages, localMessages]);

    // 加载更多
    const loadOlder = useCallback(() => {
        if (!msgData?.hasMore) return;
        setQuery((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                lastSeq: msgData.lastSeq,
            };
        });
    }, [msgData]);

    // 发送消息
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
