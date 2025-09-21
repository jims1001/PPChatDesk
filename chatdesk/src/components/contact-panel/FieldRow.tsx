import styles from "./index.module.scss";

export default function FieldRow({ icon, text, dim }: { icon: string; text?: string; dim?: boolean }) {
    return (
        <div className={`${styles.fieldRow} ${dim ? styles.dim : ""}`}>
            <span className={styles.fieldIcon}>{icon}</span>
            <span className={styles.fieldText}>{text || "—"}</span>
        </div>
    );
}
