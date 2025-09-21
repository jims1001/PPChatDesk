import { useRef, useState } from "react";
import styles from "./index.module.scss";

export default function TagInput({
    tags,
    onAdd,
    onRemove,
}: {
    tags: string[];
    onAdd?: (t: string) => void;
    onRemove?: (t: string) => void;
}) {
    const [val, setVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const add = () => {
        const t = val.trim();
        if (!t) return;
        onAdd?.(t);
        setVal("");
        inputRef.current?.focus();
    };

    return (
        <div>
            <div className={styles.tagList}>
                {tags.map((t) => (
                    <span key={t} className={styles.tag}>
                        {t}
                        <button className={styles.tagX} onClick={() => onRemove?.(t)}>×</button>
                    </span>
                ))}
            </div>
            <div className={styles.tagInputRow}>
                <button className={styles.plusBtn} onClick={add}>＋</button>
                <input
                    ref={inputRef}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder="添加标签"
                    className={styles.tagInput}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") add();
                    }}
                />
            </div>
        </div>
    );
}
