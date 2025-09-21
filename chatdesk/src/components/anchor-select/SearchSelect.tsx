import React, { useMemo, useState } from "react";
import styles from "./index.module.scss";

export type Option = {
    id: string;
    label: string;
    left?: React.ReactNode;  // 图标/头像
};

export default function SearchSelect({
    title = "选择",
    placeholder = "查找…",
    options,
    value,
    onChange,
    showSearch = true,
}: {
    title?: string;
    placeholder?: string;
    options: Option[];
    value?: string | null;
    onChange: (id: string) => void;
    showSearch?: boolean;
}) {
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const kw = q.trim().toLowerCase();
        return kw ? options.filter(o => o.label.toLowerCase().includes(kw)) : options;
    }, [q, options]);

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <span>{title}</span>
                <button className={styles.closeX} onClick={() => window.dispatchEvent(new CustomEvent("anchor-popover-close"))}>×</button>
            </div>

            {showSearch && (
                <input
                    className={styles.search}
                    placeholder={placeholder}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoFocus
                />
            )}

            <div className={styles.optionList}>
                {filtered.map(o => (
                    <button
                        key={o.id}
                        className={`${styles.option} ${o.id === value ? styles.optionActive : ""}`}
                        onClick={() => onChange(o.id)}
                    >
                        <span className={styles.left}>{o.left}</span>
                        <span className={styles.label}>{o.label}</span>
                        {o.id === value && <span className={styles.check}>✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}
