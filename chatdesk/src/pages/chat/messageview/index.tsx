import { useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import MessageList from "@/pages/chat/messageview/messageList";
import type { ChatMessage } from "@/pages/chat/messageview//type";
import Composer from "./composer";
import ReplyBox from "./replay";

const PAGE_SIZE = 30;
const TOTAL_FAKE = 240;

const now = Date.now();
const tailSeed: ChatMessage[] = [
    { id: "m1", kind: "text", direction: "in", text: "你好 咨询下 家具的事情", createdAt: now - 1000 * 60 * 5 },
    { id: "m2", kind: "text", direction: "out", text: "给团队一个联系您的方法。", createdAt: now - 1000 * 60 * 4 + 10 },
    { id: "m3", kind: "text", direction: "out", text: "通过电子邮件得到通知", createdAt: now - 1000 * 60 * 4 },
    { id: "m4", kind: "text", direction: "out", text: "kimjms@fas.com", createdAt: now - 1000 * 60 * 4 - 5 },
    { id: "m5", kind: "text", direction: "in", text: "请问需要咨询哪方面的家具呢 我这边主要处理欧美相关的家具", createdAt: now - 1000 * 60 * 3 },
];

// 构造一个“后端消息库”：时间递增
function buildFakeDB(total: number): ChatMessage[] {
    const base = now - total * 60_000;
    const histCount = Math.max(0, total - tailSeed.length);
    const history: ChatMessage[] = Array.from({ length: histCount }).map((_, i) => ({
        id: `old-${i + 1}`,
        kind: "text",
        direction: i % 2 === 0 ? "in" : "out",
        text: `历史消息 #${i + 1}`,
        createdAt: base + i * 60_000,
    }));
    const shiftedTail = tailSeed.map((m, idx) => ({
        ...m,
        id: m.id || `seed-${idx}`,
        createdAt: base + histCount * 60_000 + (idx + 1) * 60_000,
    }));
    return [...history, ...shiftedTail];
}

export default function ChatWindow() {
    const DB = useMemo(() => buildFakeDB(TOTAL_FAKE), []);
    // 初始化时：把它们对齐
    const total = DB.length;
    const PAGE_SIZE = 50;
    const initialStart = Math.max(0, total - PAGE_SIZE);

    const [messages, setMessages] = useState(() => DB.slice(initialStart, total));
    const [rangeStart, setRangeStart] = useState(initialStart);
    // 关键：firstIndex 与 rangeStart 对齐
    const [firstIndex, setFirstIndex] = useState(initialStart);

    const [hasMore, setHasMore] = useState(initialStart > 0);
    const [loadingMore, setLoadingMore] = useState(false);

    // 触顶：加载上一页，并下调 firstIndex，避免视觉抖动
    const loadOlder = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        await new Promise(r => setTimeout(r, 500));

        const nextStart = Math.max(0, rangeStart - PAGE_SIZE);
        const older = DB.slice(nextStart, rangeStart);

        setFirstIndex(prev => prev - older.length); // ⭐️ 关键：虚拟索引向前移动
        setMessages(prev => [...older, ...prev]);
        setRangeStart(nextStart);
        setHasMore(nextStart > 0);
        setLoadingMore(false);
    }, [loadingMore, hasMore, rangeStart, DB]);

    // 发送（尾部追加）：followOutput="auto" 会在底部时自动跟随
    const onSend = useCallback((html: string, plain: string) => {
        const m: ChatMessage = {
            id: `m-${Date.now()}`,
            kind: "text",
            direction: "out",
            text: (plain || html).trim(),
            createdAt: Date.now(),
        };
        setMessages(prev => [...prev, m]);
        // 如需写回“后端库”，可以 DB.push(m);
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
                    firstItemIndex={firstIndex}   // ✅ 传入
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadOlder={loadOlder}
                    footerText={footer}
                />
            </div>
            <div className={styles.composerWrap}>
                <div style={{ maxWidth: 720, margin: "24px auto" }}>
                    <ReplyBox
                        onSend={(p) => {/* 发送 */ }}
                    />
                </div>
            </div>
        </div>
    );
}