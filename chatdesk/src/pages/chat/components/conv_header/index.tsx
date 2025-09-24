
import s from "./index.module.scss";

export default function ConversationHeader() {
    return (
        <div className={s.header}>
            <div className={s.left}>
                <span className={s.title}>会话</span>
                <button className={s.openBtn}>打开</button>
            </div>

            <div className={s.right}>
                {/* 筛选 */}
                <div className={s.relative}>
                    <button id="toggleConversationFilterButton" className={s.iconBtn} title="筛选">
                        <span className="i-lucide-list-filter" />
                    </button>
                    <div id="conversationFilterTeleportTarget" className={s.teleport} />
                </div>

                {/* 排序 */}
                <div className={`${s.relative} ${s.flex}`}>
                    <button className={s.iconBtn} title="排序">
                        <span className="i-lucide-arrow-up-down" />
                    </button>
                </div>

                {/* 收起（移动端隐藏；RTL/LTR 自适应旋转） */}
                <button
                    className={`${s.iconBtn} ${s.hideOnMobile} ${s.dirAware}`}
                    title="收起"
                >
                    <span className="i-lucide-arrow-right-to-line" />
                </button>
            </div>
        </div>
    );
}
