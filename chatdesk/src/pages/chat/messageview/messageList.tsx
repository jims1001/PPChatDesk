import { useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import styles from "./messageList.module.scss";
import MessageCell from "@/pages/chat/messageview/cell";
import type { ChatMessage } from "@/pages/chat/messageview/type";

interface Props {
    items: ChatMessage[];
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadOlder?: () => void;
    footerText?: string;
}

export default function MessageList({
    items,
    hasMore = false,
    loadingMore = false,
    onLoadOlder,
    footerText = "",
}: Props) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [showJump, setShowJump] = useState(false);

    return (
        <div className={styles.container}>
            <Virtuoso
                ref={virtuosoRef}
                className={styles.virtuoso}
                data={items}
                itemContent={(_, item) => (
                    <div className={styles.row}>
                        <MessageCell msg={item} />
                    </div>
                )}
                followOutput="auto"
                atBottomStateChange={(atBottom) => setShowJump(!atBottom)}
                startReached={() => {
                    if (onLoadOlder && hasMore && !loadingMore) onLoadOlder();
                }}
                components={{
                    Header: () => (
                        <div className={styles.header}>
                            {loadingMore ? "加载中…" : hasMore ? "" : footerText}
                        </div>
                    ),
                    Footer: () => <div style={{ height: 8 }} />,
                }}
            />
            {showJump && (
                <button
                    className={styles.jumpLatest}
                    onClick={() => virtuosoRef.current?.scrollToIndex({
                        index: items.length - 1, align: "end", behavior: "smooth",
                    })}
                >
                    跳到最新
                </button>
            )}
        </div>
    );
}
