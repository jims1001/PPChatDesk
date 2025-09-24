import React from "react";
import styles from "./index.module.scss";

export interface ConversationItemData {
    id: string;
    channel: string;      // 顶部灰色小标题，如 “家具销售”
    name: string;         // 主名称
    preview: string;      // 第二行预览文本
    timeText: string;     // 右侧时间，如 “3d • 1h”
    color?: string;       // 头像底色
    online?: boolean;     // 是否显示绿色在线小点
    initial?: string;     // 头像字母
}

interface Props {
    data: ConversationItemData;
    onClick?: (id: string) => void;
}

const ConversationItem: React.FC<Props> = ({ data, onClick }) => {
    const {
        id, channel, name, preview, timeText, color = "#f3e8ff",
        online = false, initial = "U",
    } = data;

    return (
        <div className={styles.item} onClick={() => onClick?.(id)}>
            <div className={styles.left}>
                {/* 频道图标（小显示器样式） */}
                <svg className={styles.channelIcon} viewBox="0 0 24 24" aria-hidden>
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <rect x="9" y="18" width="6" height="2" rx="1" />
                </svg>
                <span className={styles.channelText}>{channel}</span>
            </div>

            <div className={styles.row}>
                <div className={styles.avatar} style={{ background: color }}>
                    <span className={styles.initial}>{initial}</span>
                    {online && <span className={styles.dot} />}
                </div>

                <div className={styles.main}>
                    <div className={styles.title}>
                        <span className={styles.name}>{name}</span>
                        <span className={styles.time}>{timeText}</span>
                    </div>
                    <div className={styles.preview}>
                        {/* 回复箭头 */}
                        <svg className={styles.replyIcon} viewBox="0 0 24 24" aria-hidden>
                            <path d="M7 8l-4 4 4 4v-3h5a6 6 0 015 3v-1a7 7 0 00-7-7H7V8z" />
                        </svg>
                        <span className={styles.previewText}>{preview}</span>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />
        </div>
    );
};

export default ConversationItem;
