import React, { useState } from "react";
import styles from "./index.module.scss";

type Props = {
    title: string;
    defaultOpen?: boolean;
    children?: React.ReactNode;
};

export default function AccordionSection({ title, defaultOpen = false, children }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={styles.section}>
            <button className={styles.sectionHeader} onClick={() => setOpen(!open)}>
                <span className={styles.sectionTitle}>{title}</span>
                <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>▾</span>
            </button>
            {open && <div className={styles.sectionBody}>{children ?? <div className={styles.empty}>+</div>}</div>}
        </div>
    );
}
