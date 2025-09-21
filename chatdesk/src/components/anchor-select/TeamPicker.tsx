import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import AnchorPopover from "./AnchorPopover";
import SearchSelect, { type Option } from "@/components/anchor-select/SearchSelect";

const options: Option[] = [
    { id: "none", label: "啥都没有", left: <Badge text="啥" color="#7c3aed" /> },
    { id: "wood", label: "木材销售", left: <Badge text="木" color="#0ea5e9" /> },
    { id: "plant", label: "盆景多肉销售", left: <Badge text="盆" color="#f43f5e" /> },
];

export default function TeamPicker({
    value,
    onChange,
}: {
    value?: string | null;
    onChange?: (id: string) => void;
}) {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const h = () => setOpen(false);
        window.addEventListener("anchor-popover-close", h as any);
        return () => window.removeEventListener("anchor-popover-close", h as any);
    }, []);

    const cur = options.find(o => o.id === value) ?? options[0];

    return (
        <div className={styles.field}>
            {/* 左侧图标按钮（点击后在“正下方对齐”弹出） */}
            <button ref={anchorRef} className={styles.fieldBtn} onClick={() => setOpen(true)}>
                <span className={styles.pill}>
                    <Badge text={(cur.left as any)?.props?.text ?? "组"} color={(cur.left as any)?.props?.color} />
                    <span className={styles.pillLabel}>{cur.label}</span>
                </span>
                <span className={styles.chev}>▾</span>
            </button>

            <AnchorPopover
                anchorRef={anchorRef.current as any}
                open={open}
                onClose={() => setOpen(false)}
                placement="bottom-start"
                offset={8}
                widthMatchAnchor
            >
                <SearchSelect
                    title="选择团队"
                    placeholder="查找团队"
                    options={options}
                    value={cur.id}
                    onChange={(id) => {
                        onChange?.(id);
                        setOpen(false);
                    }}
                />
            </AnchorPopover>
        </div>
    );
}

function Badge({ text, color = "#2563eb" }: { text: string; color?: string }) {
    return (
        <span
            className={styles.badge}
            style={{ background: "#f3f4f6", color, borderColor: color }}
            title={text}
        >
            {text}
        </span>
    );
}
