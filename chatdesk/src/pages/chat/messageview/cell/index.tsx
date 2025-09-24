import React from "react";
import styles from "./MessageCell.module.scss";
import type { ChatMessage } from "@/pages/chat/messageview/type";

// 各类型渲染组件
import TextMessage from "@/pages/chat/messageview/textMessage";
import ImageMessage from "@/pages/chat/messageview//imageMessage";
import VideoMessage from "@/pages/chat/messageview/videoMessage";
import SystemMessage from "@/pages/chat/messageview/systemMessage";

function formatTime(ts: number) {
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
}

export default function MessageCell({ msg }: { msg: ChatMessage }) {
    if (msg.kind === "system" || msg.direction === "system") {
        return (
            <div className={styles.systemWrap}>
                <SystemMessage msg={msg} />
            </div>
        );
    }

    const isOut = msg.direction === "out";
    const bubbleClass = `${styles.bubble} ${isOut ? styles.out : styles.in}`;

    const renderBody = () => {
        switch (msg.kind) {
            case "text": return <TextMessage msg={msg} />;
            case "image": return <ImageMessage msg={msg} />;
            case "video": return <VideoMessage msg={msg} />;
            default: return null;
        }
    };

    return (
        <div className={isOut ? styles.alignRight : styles.alignLeft}>
            <div className={bubbleClass}>
                <div className={styles.body}>{renderBody()}</div>
                <div className={styles.meta}>{formatTime(msg.createdAt)}</div>
            </div>
        </div>
    );
}
