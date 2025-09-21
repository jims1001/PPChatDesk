export type Conversation = {
    id: string;
    title: string;          // 会话名/客户名
    snippet?: string;       // 最近一条消息
    unread?: number;        // 未读
    lastAt?: string;        // 相对时间，如 "1h • 32m"
    avatarText?: string;    // 头像字母
    statusDot?: "online" | "offline" | "busy";
};

export type PageResp = {
    items: Conversation[];
    nextCursor?: string | null;
};
