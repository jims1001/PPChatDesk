import { useEffect, useMemo, useState } from "react";
import Tabs, { type TabItem } from "@/pages/chat/components/tabs";
import TabPane from "@/pages/chat/components/tabPanel";
import ConversationList from "@/pages/chat/components/conversationList";
import { type ConversationItemData } from "@/pages/chat/components/conversationItem";
import styles from "./index.module.scss";
import { useGetChatConversatin } from "@/data/conversation/hook/useGetChatConversation";
import { useGetUser } from "@/data/user/hook/useGetUser";
import { useNavigate } from "react-router-dom";
import { useWSList } from "@/net/lib/ws/useWSList";

// 把后端的一个会话转成列表要的结构
function mapConversationToItem(conv: any): ConversationItemData {
    const user = conv.UserInfo || {};
    const name = user.Nickname || user.UserID || "未知用户";
    const preview = user.Bio || "";
    const updatedAt = conv.UpdatedAt || conv.CreateTime;
    return {
        id: conv.ConversationID,
        channel: "客服会话",
        name,
        preview,
        timeText: updatedAt ? new Date(updatedAt).toLocaleString() : "",
        initial: name.slice(0, 1).toUpperCase(),
        color: "#e9d5ff",
        online: user.Presence === "online",
    };
}

export default function ChatViewApp() {

    const ws = useWSList<any>({
        listKey: "chat-conversation",
        reduce: (prev, item) => [...prev, item],
    });

    console.log('ChatViewApp ws', ws);

    // 分页参数
    const [page, setPage] = useState(1);
    const limit = 20;

    // 1) 先拿用户
    const { data: user, isLoading: isUserLoading } = useGetUser(undefined, {
        revalidateOnFocus: false,
        revalidateOnMount: false,
    });

    // 只有登录了才去拉会话
    const isLoggedIn = !!user; // 这里你也可以根据实际字段改成 !!user?.userID

    // 2) 列表数据本地维护
    const [items, setItems] = useState<ConversationItemData[]>([]);
    const [hasMore, setHasMore] = useState(true);

    // 3) 拉数据：这里做成“条件请求”
    // isLoggedIn 为 false 时传 null，SWR 不会请求
    const {
        data,
        mutate,
        isLoading,
    } = useGetChatConversatin(
        isLoggedIn ? { page, limit } : undefined,
        {
            revalidateOnMount: true,
        }
    );


    const navigate = useNavigate();


    // 把现有会话里的 userId 收集一下，方便判断
    const existingIds = useMemo(() => {
        if (!data) return new Set<string>();
        // 根据你实际结构改，这里假设会话里有 participantId / userId 之类的
        return new Set(data.map((c: any) => c.UserID));
    }, [data]);


    useEffect(() => {
        if (!ws.list || ws.list.length === 0) return;
        if (!existingIds || existingIds.size === 0) return;

        const unknownSenders = new Set<string>();

        for (const item of ws.list) {

            if (item.type == 1) {
                const from = item?.from;
                if (!from) continue;

                if (!existingIds.has(from)) {
                    unknownSenders.add(from);
                }
            }
        }

        // 只要发现有新的发送者，就刷新一次
        if (unknownSenders.size > 0) {
            console.log("[useChat] 发现新会话用户：", [...unknownSenders]);
            mutate(); // 🔄 重新拉会话列表
        }
    }, [ws.list, existingIds]);


    // 4) 用户变化时重置分页与本地列表
    useEffect(() => {
        if (!isLoggedIn) {
            // 退出登录或还没登录，清空
            setItems([]);
            setHasMore(true);
            setPage(1);
        } else {
            // 刚登录，触发一次第一页拉取
            // 如果你的 useGetChatConversatin 会在 params 变化时自动拉，就不用这里手动 mutate
            // mutate();
        }
    }, [isLoggedIn]); // 注意依赖



    // 5) 后端数据来了，合并到本地
    useEffect(() => {

        if (!user) {
            console.log('获取到空用户');
            return;
        };

        if (!data) {
            console.log('获取到空数据');
            return;
        }
        const mapped = data.map(mapConversationToItem);

        if (page === 1) {
            setItems(mapped);
        } else {
            setItems((prev) => [...prev, ...mapped]);
        }

        if (data.length < limit) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
    }, [data, page, limit]);

    // 6) 加载更多
    const loadMore = () => {
        if (isLoading) return;
        if (!hasMore) return;
        if (!isLoggedIn) return;
        setPage((p) => p + 1);
    };

    // tab 数量
    const tabs: TabItem[] = useMemo(
        () => [
            { key: "my", label: "我的", count: items.length },
            { key: "unassigned", label: "未分配的", count: 0 },
            { key: "all", label: "所有的", count: items.length },
        ],
        [items.length]
    );


    const handleClick = (id: string) => {
        let from = "";
        const refreshKey = Math.random();
        for (const item of data ?? []) {
            if (item.ConversationID === id) {
                from = item.UserID ?? "'";
                break;
            }
        }

        if (from === "") {
            console.log("没有找到对应的会话");
        }

        navigate("/chat/" + id, { state: { fromUser: from, refreshKey } }); // ✅ 跳转到 http://localhost:5173/chat
    };


    const [active, setActive] = useState("my");

    // 7) 渲染阶段区分情况
    if (isUserLoading) {
        return <div className={styles.ChatViewApp}>检查登录中...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className={styles.ChatViewApp}>
                <div className={styles.panel}>
                    <div style={{ padding: 16 }}>请先登录，再查看会话列表。</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.ChatViewApp}>
            <div className={styles.panel}>
                <Tabs tabs={tabs} defaultActiveKey={active} onChange={setActive} />

                <div className={styles.tabPanelItem}>
                    <TabPane activeKey={active} tabKey="my">
                        <div className={styles.fillScroll}>
                            <ConversationList onItemClick={(id) => {
                                console.log('点击了会话1', id);
                                handleClick(id);
                            }}
                                items={items}
                                hasMore={hasMore}
                                loading={isLoading}
                                onLoadMore={loadMore}
                            />
                        </div>
                    </TabPane>

                    <TabPane activeKey={active} tabKey="unassigned">
                        <div className={styles.fillScroll}>
                            <ConversationList items={[]} />
                        </div>
                    </TabPane>

                    <TabPane activeKey={active} tabKey="all">
                        <div className={styles.fillScroll}>
                            <ConversationList onItemClick={(id) => {
                                console.log('点击了会话2', id);
                            }}
                                items={items}
                                hasMore={hasMore}
                                loading={isLoading}
                                onLoadMore={loadMore}
                            />
                        </div>
                    </TabPane>
                </div>
            </div>
        </div>
    );
}
