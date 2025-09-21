import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./index.module.scss";

type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export default function AnchorPopover({
    anchorRef,
    open,
    onClose,
    placement = "bottom-start",
    offset = 6,
    widthMatchAnchor = false,
    children,
}: {
    anchorRef?: React.RefObject<HTMLElement>;
    open: boolean;
    onClose: () => void;
    placement?: Placement;
    offset?: number;
    widthMatchAnchor?: boolean;
    children: React.ReactNode;
}) {
    const popRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

    // 计算定位
    const compute = () => {
        const anchor = anchorRef?.current || document.body;
        const pop = popRef.current;
        if (!anchor || !pop) return;

        const a = anchor.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // 先用期望位
        let top = a.bottom + offset;
        let left = placement.endsWith("end") ? a.right - pop.offsetWidth : a.left;

        // 边界修正（水平不溢出；垂直若到底就放上方）
        if (left + pop.offsetWidth > vw - 8) left = vw - pop.offsetWidth - 8;
        if (left < 8) left = 8;
        if (top + pop.offsetHeight > vh - 8) top = a.top - pop.offsetHeight - offset;

        setStyle({
            position: "fixed",
            top,
            left,
            minWidth: widthMatchAnchor ? a.width : undefined,
            visibility: "visible",
        });
    };

    useLayoutEffect(() => { if (open) compute(); }, [open]);
    useEffect(() => {
        if (!open) return;
        const onScroll = () => compute();
        const onResize = () => compute();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            const pop = popRef.current;
            const anchor = anchorRef?.current;
            const t = e.target as Node;
            if (!pop || !anchor) return;
            if (!pop.contains(t) && !anchor.contains(t)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;
    return createPortal(
        <div ref={popRef} className={styles.popover} style={style}>
            {children}
        </div>,
        document.body
    );
}
