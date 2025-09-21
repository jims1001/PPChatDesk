import React, { useState } from "react";
import styles from "./index.module.scss";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface CollapseSectionProps {
    title: string;
    children?: React.ReactNode;
    defaultOpen?: boolean;
}

export default function CollapseSection({
    title,
    children,
    defaultOpen = true,
}: CollapseSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={styles.section}>
            <div className={styles.header} onClick={() => setOpen(!open)}>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>{title}</span>
            </div>
            {open && <div className={styles.content}>{children}</div>}
        </div>
    );
}
