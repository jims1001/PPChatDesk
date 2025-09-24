import { useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import MessageList from "./messageList";
import type { ChatMessage } from "@/pages/chat/messageview//type";
import Composer from "./composer";

const now = Date.now();

const seed: ChatMessage[] = [
    { id: "m1", kind: "text", direction: "in", text: "你好 咨询下 家具的事情", createdAt: now - 1000 * 60 * 5 },
    { id: "m2", kind: "text", direction: "out", text: "给团队一个联系您的方法。", createdAt: now - 1000 * 60 * 4 + 10 },
    { id: "m3", kind: "text", direction: "out", text: "通过电子邮件得到通知", createdAt: now - 1000 * 60 * 4 },
    { id: "m4", kind: "text", direction: "out", text: "kimjms@fas.com", createdAt: now - 1000 * 60 * 4 - 5 },
    { id: "m5", kind: "text", direction: "in", text: "请问需要咨询哪方面的家具呢 我这边主要处理欧美相关的家具", createdAt: now - 1000 * 60 * 3 },
];

export default function ChatWindow() {
    const [messages, setMessages] = useState<ChatMessage[]>(seed);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadOlder = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        await new Promise(r => setTimeout(r, 500));
        const start = messages.length + 1;
        const older: ChatMessage[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `old-${start + i}`,
            kind: "text",
            direction: i % 3 === 0 ? "in" : "out",
            text: String(100 + i),
            createdAt: now - 1000 * 60 * (7 + i),
        }));
        setMessages(prev => [...older, ...prev]);
        if (messages.length + older.length > 80) setHasMore(false);
        setLoadingMore(false);
    }, [hasMore, loadingMore, messages.length]);

    const onSend = useCallback((html: string, plain: string) => {
        const m: ChatMessage = {
            id: `m-${Date.now()}`,
            kind: "text",
            direction: "out",
            text: plain.trim() || html,
            createdAt: Date.now(),
        };
        setMessages(prev => [...prev, m]);
    }, []);

    const onPickFile = useCallback((file: File) => {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const kind: ChatMessage["kind"] =
            /png|jpe?g|gif|webp/.test(ext) ? "image" :
                /mp4|webm|ogg/.test(ext) ? "video" :
                    /mp3|wav|m4a|aac|ogg/.test(ext) ? "audio" : "file";
        const url = URL.createObjectURL(file);
        setMessages(prev => [
            ...prev,
            {
                id: `att-${Date.now()}`,
                kind,
                direction: "out",
                createdAt: Date.now(),
                attachments: [{ url, name: file.name, size: file.size, mime: file.type }],
                text: kind === "file" ? file.name : undefined,
            },
        ]);
    }, []);

    const footer = useMemo(() => (hasMore ? "" : "所有对话已加载 🎉"), [hasMore]);

    return (
        <div className={styles.root}>
            <div className={styles.messages}>
                <MessageList
                    items={messages}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadOlder={loadOlder}
                    footerText={footer}
                />
            </div>
            <div className={styles.composerWrap}>
                <Composer onSend={onSend} onPickFile={onPickFile} />
            </div>
        </div>
    );
}
