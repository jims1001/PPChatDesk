import { useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";
import ConversationItem from "./ConversationItem";
import LoadMoreSentinel from "./LoadMoreSentinel";
import type { Conversation, PageResp } from '@/data/conversation/type';

type Props = {
    /** 首屏数据 */
    initial: PageResp;
    /** 加载更多（向下翻页） */
    fetchMore: (cursor?: string | null) => Promise<PageResp>;
    /** 点击项 */
    onSelect?: (id: string) => void;
    /** 当前选中 id */
    activeId?: string;
    /** 列表容器高度（默认填满父容器） */
    height?: number | string;
};

export default function ConversationList({
    initial,
    fetchMore,
    onSelect,
    activeId,
    height = "100%",
}: Props) {
    const [items, setItems] = useState<Conversation[]>(initial.items);
    const [cursor, setCursor] = useState<string | null | undefined>(initial.nextCursor);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading || !cursor) return;
        setLoading(true);
        try {
            const resp = await fetchMore(cursor);
            setItems(prev => [...prev, ...resp.items]);
            setCursor(resp.nextCursor ?? null);
        } finally {
            setLoading(false);
        }
    }, [cursor, fetchMore, loading]);

    // 首屏很短时自动补一次
    useEffect(() => {
        if (items.length < 6 && cursor && !loading) {
            loadMore();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.listWrap} style={{ height }}>
            <div className={styles.listScrollable}>
                {items.map(c => (
                    <ConversationItem
                        key={c.id}
                        data={c}
                        active={c.id === activeId}
                        onClick={onSelect}
                    />
                ))}

                {/* 触底加载哨兵 */}
                <LoadMoreSentinel onAppear={loadMore} disabled={loading || !cursor} />

                {/* 尾部状态区 */}
                <div className={styles.footer}>
                    {loading ? (
                        <span className={styles.tip}>加载中…</span>
                    ) : cursor ? (
                        <button className={styles.loadBtn} onClick={loadMore}>加载更多</button>
                    ) : (
                        <span className={styles.tip}>所有对话已加载 🎉</span>
                    )}
                </div>
            </div>
        </div>
    );
}
