import React, { useEffect, useMemo, useRef } from "react";
import ConversationItem, { type ConversationItemData } from "@/pages/chat/components/conversationItem";
import styles from "./index.module.scss";

interface Props {
    items: ConversationItemData[];
    onItemClick?: (id: string) => void;
    footerText?: string;

    /** 是否还有更多数据 */
    hasMore?: boolean;
    /** 是否正在加载 */
    loading?: boolean;
    /** 触底加载的回调 */
    onLoadMore?: () => void;

    /** 列表高度；不传则不做内部滚动，监听窗口滚动 */
    height?: number | string;
}

const ConversationList: React.FC<Props> = ({
    items,
    onItemClick,
    footerText = "所有对话已加载 🎉",
    hasMore = false,
    loading = false,
    onLoadMore,
    height, // 例如 480 / "60vh"
}) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const observerRoot = useMemo(() => {
        // 有 height 就用自身作为滚动容器；否则使用窗口
        return height ? (rootRef.current as Element | null) : null;
    }, [height]);

    useEffect(() => {
        if (!onLoadMore) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            {
                root: observerRoot, // 内部滚动容器 or 窗口
                rootMargin: "120px",
                threshold: 0.01,
            }
        );

        io.observe(sentinel);
        return () => io.disconnect();
    }, [onLoadMore, hasMore, loading, observerRoot]);

    const style: React.CSSProperties = {};
    if (height !== undefined) {
        style.height = height;
        style.overflow = "auto";
    }

    return (
        <div className={styles.list} ref={rootRef} style={style}>
            {items.map((x) => (
                <ConversationItem key={x.id} data={x} onClick={onItemClick} />
            ))}

            {/* 加载中 / 触底占位 */}
            <div ref={sentinelRef} className={styles.sentinel}>
                {loading ? <span className={styles.loader}>加载中…</span> : null}
            </div>

            {/* 没有更多时显示 footer */}
            {!hasMore && !loading && (
                <div className={styles.footer}>{footerText}</div>
            )}
        </div>
    );
};

export default ConversationList;
