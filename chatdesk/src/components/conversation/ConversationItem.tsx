import { type Conversation } from "@/data/conversation/type";
import styles from "./index.module.scss";

type Props = {
    data: Conversation;
    active?: boolean;
    onClick?: (id: string) => void;
};

export default function ConversationItem({ data, active, onClick }: Props) {
    return (
        <div
            className={`${styles.item} ${active ? styles.itemActive : ""}`}
            onClick={() => onClick?.(data.id)}
        >
            <div className={styles.avatar}>
                <span>{data.avatarText ?? data.title?.[0]?.toUpperCase()}</span>
                {data.statusDot && <i className={`${styles.dot} ${styles[data.statusDot]}`} />}
            </div>

            <div className={styles.main}>
                <div className={styles.row1}>
                    <div className={styles.title}>{data.title}</div>
                    {data.lastAt && <div className={styles.time}>{data.lastAt}</div>}
                </div>
                <div className={styles.row2}>
                    <div className={styles.snippet}>{data.snippet}</div>
                    {!!data.unread && <span className={styles.badge}>{data.unread}</span>}
                </div>
            </div>
        </div>
    );
}
