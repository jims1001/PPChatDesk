import { useState } from "react";
import Tabs, { type TabItem } from "@/pages/chat/components/tabs";
import TabPane from "@/pages/chat/components/tabPanel";
import ConversationList from "@/pages/chat/components/conversationList";
import { type ConversationItemData } from "@/pages/chat/components/conversationItem";
import styles from "./index.module.scss";

const seed: ConversationItemData[] = [
    {
        id: "1",
        channel: "家具销售",
        name: "Kimjms",
        preview: "33343",
        timeText: "3d • 1h",
        initial: "K",
        color: "#fce7f3",
        online: true,
    },
    {
        id: "2",
        channel: "家具销售",
        name: "Lingering-Wave-884",
        preview: "你好  请问需要帮忙吗",
        timeText: "3d • 2d",
        initial: "L",
        color: "#f5d0fe",
    },
];

function makeMore(start: number, count: number): ConversationItemData[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${start + i + 1}`,
        channel: "家具销售",
        name: `Guest-${start + i + 1}`,
        preview: "自动加载的历史消息预览",
        timeText: `${3 + i}d • ${i}h`,
        initial: "G",
        color: "#e9d5ff",
    }));
}

export default function ChatViewApp() {
    const [active, setActive] = useState("my");
    const [items, setItems] = useState<ConversationItemData[]>(seed);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const tabs: TabItem[] = [
        { key: "my", label: "我的", count: items.length },
        { key: "unassigned", label: "未分配的", count: 0 },
        { key: "all", label: "所有的", count: items.length },
    ];

    const loadMore = () => {
        setLoading(true);
        setTimeout(() => {
            const more = makeMore(items.length, 10);
            const next = [...items, ...more];
            setItems(next);
            setLoading(false);
            if (next.length >= 42) setHasMore(false);
        }, 800);
    };

    return (
        <div className={styles.ChatViewApp}>
            <div className={styles.panel}>
                <Tabs tabs={tabs} defaultActiveKey={active} onChange={setActive} />

                {/* 内容区——填满剩余高度 */}
                <div className={styles.tabPanelItem}>
                    <TabPane activeKey={active} tabKey="my">
                        {/* 让列表自己滚动：不再传 height，交给 CSS */}
                        <div className={styles.fillScroll}>
                            <ConversationList items={items} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
                        </div>
                    </TabPane>

                    <TabPane activeKey={active} tabKey="unassigned">
                        <div className={styles.fillScroll}>
                            <ConversationList items={[]} />
                        </div>
                    </TabPane>

                    <TabPane activeKey={active} tabKey="all">
                        <div className={styles.fillScroll}>
                            <ConversationList items={items} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
                        </div>
                    </TabPane>
                </div>
            </div>
        </div>
    );
}
