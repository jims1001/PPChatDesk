import type { ChatMessage } from "@/pages/chat/messageview/type";
import styles from "./index.module.scss";

export default function VideoMessage({ msg }: { msg: ChatMessage }) {
    return (
        <div className={styles.wrap}>
            {msg.attachments?.map(a => (
                <video key={a.url} src={a.url} controls className={styles.video} />
            ))}
        </div>
    );
}
