import type { ChatMessage } from "@/pages/chat/messageview//type";
import styles from "./index.module.scss";

export default function ImageMessage({ msg }: { msg: ChatMessage }) {
    return (
        <div className={styles.wrap}>
            {msg.attachments?.map(a => (
                <img key={a.url} src={a.url} alt={a.name || "image"} className={styles.img} />
            ))}
        </div>
    );
}