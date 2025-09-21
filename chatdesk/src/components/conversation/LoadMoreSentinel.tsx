import { useEffect, useRef } from "react";
import styles from "./index.module.scss";

type Props = {
    onAppear: () => void;        // 进入视口触发
    disabled?: boolean;          // 没有更多/正在加载时禁用
};

export default function LoadMoreSentinel({ onAppear, disabled }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled) return;
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) onAppear();
        }, { rootMargin: "200px" }); // 预取
        io.observe(el);
        return () => io.disconnect();
    }, [disabled, onAppear]);

    return <div ref={ref} className={styles.sentinel} />;
}
