import type { ChatMessage } from "@/pages/chat/messageview/type";
import styles from "./index.module.scss";

export default function SystemMessage({ msg }: { msg: ChatMessage }) {
    return <div className={styles.system}>{msg.text}</div>;
}