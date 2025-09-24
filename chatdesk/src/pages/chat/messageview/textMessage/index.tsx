import React from "react";
import type { ChatMessage } from "../../types/types";
import styles from "./index.module.scss";

export default function TextMessage({ msg }: { msg: ChatMessage }) {
    return <div className={styles.text}>{msg.text}</div>;
}