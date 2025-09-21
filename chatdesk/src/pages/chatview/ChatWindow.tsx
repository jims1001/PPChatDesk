import { useCallback, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { TiptapComposer, type TiptapComposerHandle } from "@/pages/chatview/TiptapComposer";
import styles from "./index.module.scss";

type Message = {
    id: string | number;
    author: "me" | "other";
    text: string;
    createdAt: number;
};

export default function ChatWindow() {
    const [items, setItems] = useState<Message[]>([
        { id: 1, author: "other", text: "你好，咨询下家具的事情", createdAt: Date.now() },
        { id: 2, author: "me", text: "请问需要哪方面呢？", createdAt: Date.now() + 1 },
    ]);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const composerRef = useRef<TiptapComposerHandle>(null);
    const [atBottom, setAtBottom] = useState(true);

    const scrollToBottom = useCallback(() => {
        virtuosoRef.current?.scrollToIndex({
            index: items.length - 1,
            align: "end",
            behavior: "smooth",
        });
    }, [items.length]);

    const onSend = useCallback(
        (html: string) => {
            if (!html.trim()) return;
            const msg: Message = {
                id: crypto.randomUUID(),
                author: "me",
                text: html.replace(/<[^>]+>/g, ""), // 简单转纯文本
                createdAt: Date.now(),
            };
            setItems((old) => [...old, msg]);
            composerRef.current?.clear();
            scrollToBottom();
        },
        [scrollToBottom]
    );

    const itemContent = useCallback(
        (_: number, m: Message) => (
            <div className={styles.messageRow}>
                <div
                    className={[
                        styles.messageBubble,
                        m.author === "me" ? styles.bubbleMe : styles.bubbleOther,
                    ].join(" ")}
                >
                    {m.text}
                </div>
            </div>
        ),
        []
    );

    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>Chat · CSS Modules</div>

            <div className={styles.messageArea}>
                <Virtuoso
                    ref={virtuosoRef}
                    style={{ height: "100%" }}
                    data={items}
                    itemContent={itemContent}
                    followOutput={atBottom ? "smooth" : false}
                    atBottomStateChange={setAtBottom}
                />
                {!atBottom && (
                    <button onClick={scrollToBottom} className={styles.jumpBottomBtn}>
                        回到底部 ⤓
                    </button>
                )}
            </div>

            <div className={styles.footer}>
                <TiptapComposer ref={composerRef} mode="note" onAddNote={onSend} onSend={onSend} />
            </div>
        </div>
    );
}
