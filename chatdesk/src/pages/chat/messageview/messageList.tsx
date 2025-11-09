import { useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import styles from "./messageList.module.scss";
import MessageCell from "@/pages/chat/messageview/cell";
import type { ChatMessage } from "@/data/conversation/chatMessage";

interface Props {
    items: ChatMessage[];
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadOlder?: () => void;
    footerText?: string;

    /** 关键：第一条数据的虚拟索引，用于“头部追加时不跳动” */
    firstItemIndex: number;
}

export default function MessageList({
    items,
    hasMore = false,
    loadingMore = false,
    onLoadOlder,
    footerText = "",
    firstItemIndex = 0,
}: Props) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [showJump, setShowJump] = useState(false);

    const goLatest = () => {
        if (!virtuosoRef.current) return;
        // 更稳妥：直接把容器滚到最大高度（避免 firstItemIndex 计算出现负数导致反向）
        virtuosoRef.current.scrollTo({ top: 10 ** 9, behavior: "smooth" });
        // 如果你仍然想用索引，可保留这行作为“首选”，失败再回退到上面：
        // const idx = firstItemIndex + items.length - 1;
        // virtuosoRef.current.scrollToIndex({ index: idx, align: "end", behavior: "smooth" });
    };

    return (
        <div className={styles.container}>
            <Virtuoso
                ref={virtuosoRef}
                className={styles.virtuoso}
                data={items}
                firstItemIndex={firstItemIndex}
                itemContent={(i, item) => (
                    <div className={styles.row} key={'item' + i}>
                        <MessageCell key={"msg" + i} msg={item as ChatMessage} />
                    </div>
                )}
                computeItemKey={(i, _) => 'MessageList' + i}
                followOutput="auto"
                increaseViewportBy={{ top: 600, bottom: 600 }}
                atBottomStateChange={(atBottom) => setShowJump(!atBottom)}
                startReached={() => {
                    if (onLoadOlder && hasMore && !loadingMore) onLoadOlder();
                }}
                components={{
                    Header: () => (
                        <div className={styles.header} key={"msg_header"}>
                            {loadingMore ? "加载中…" : hasMore ? "" : footerText}
                        </div>
                    ),
                    Footer: () => <div style={{ height: 8 }} />,
                }}
            />

            {showJump && (
                <button className={styles.jumpLatest} onClick={goLatest}>
                    跳到最新
                </button>
            )}
        </div>
    );
}