import styles from "./index.module.scss";
import AccordionSection from "@/components/contact-panel/AccordionSection";
import FieldRow from "@/components/contact-panel/FieldRow";
import TagInput from "@/components/contact-panel/TagInput";

export type ContactProfile = {
    id: string;
    name: string;
    avatarText?: string;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    location?: string | null; // "Yerevan, Armenia"
    flags?: string[];         // emoji flags
    assignee?: { id: string; name: string; online?: boolean } | null;
    team?: { id: string; name: string } | null;
    priority?: "none" | "low" | "medium" | "high";
    tags?: string[];
};

type Props = {
    data: ContactProfile;
    onClose?: () => void;
    onAssignAgent?: () => void;
    onAssignTeam?: () => void;
    onPriorityChange?: (p: ContactProfile["priority"]) => void;
    onAddTag?: (t: string) => void;
    onRemoveTag?: (t: string) => void;
    onDelete?: () => void;
    onMute?: () => void;
    onBlock?: () => void;
};

export default function ContactProfilePanel({
    data,
    onClose,
    onAssignAgent,
    onAssignTeam,
    onPriorityChange,
    onAddTag,
    onRemoveTag,
    onDelete,
    onMute,
}: Props) {
    return (
        <aside className={styles.panel}>
            {/* 头部 */}
            <header className={styles.header}>
                <div className={styles.title}>联系人</div>
                <button className={styles.iconBtn} onClick={onClose} title="关闭">✕</button>
            </header>

            {/* 基本信息 */}
            <section className={styles.profileCard}>
                <div className={styles.avatar}>
                    {data.avatarText?.slice(0, 1).toUpperCase() ?? data.name.slice(0, 1).toUpperCase()}
                </div>
                <div className={styles.nameRow}>
                    <div className={styles.name}>{data.name}</div>
                    <div className={styles.linkIcons}>
                        <a className={styles.link} title="在新页打开">↗</a>
                        <a className={styles.link} title="复制链接">⧉</a>
                    </div>
                </div>

                <div className={styles.fields}>
                    <FieldRow icon="✉" text={data.email ?? "不可用"} dim={!data.email} />
                    <FieldRow icon="☎" text={data.phone ?? "不可用"} dim={!data.phone} />
                    <FieldRow icon="🟢" text={data.whatsapp ?? "不可用"} dim={!data.whatsapp} />
                    <FieldRow
                        icon="📍"
                        text={[data.location, ...(data.flags ?? [])].filter(Boolean).join(" ")}
                        dim={!data.location && !(data.flags?.length)}
                    />
                </div>

                {/* 快捷操作 */}
                <div className={styles.quickActions}>
                    <button className={styles.roundBtn} title="分配" onClick={onAssignAgent}>👤</button>
                    <button className={styles.roundBtn} title="备注">📝</button>
                    <button className={styles.roundBtn} title="静音" onClick={onMute}>🔕</button>
                    <button className={`${styles.roundBtn} ${styles.danger}`} title="删除" onClick={onDelete}>🗑</button>
                </div>
            </section>

            {/* 分组：对话操作 */}
            <AccordionSection title="对话操作" defaultOpen>
                <div className={styles.rowSpace}>
                    <span className={styles.muted}>—</span>
                </div>
            </AccordionSection>

            {/* 分组：已分配的客服代表 */}
            <AccordionSection title="已分配的客服代表" defaultOpen>
                <div className={styles.assignRow} onClick={onAssignAgent}>
                    <div className={styles.agentBadge}>
                        <span className={styles.agentDot} data-online={data.assignee?.online} />
                        <span className={styles.agentName}>{data.assignee?.name ?? "未分配"}</span>
                    </div>
                    <span className={styles.chevron}>▾</span>
                </div>
            </AccordionSection>

            {/* 分组：已分配的团队 */}
            <AccordionSection title="已分配的团队" defaultOpen>
                <div className={styles.assignRow} onClick={onAssignTeam}>
                    <div className={styles.teamBadge}>
                        <span className={styles.teamIcon}>盆</span>
                        <span className={styles.teamName}>{data.team?.name ?? "未分配"}</span>
                    </div>
                    <span className={styles.chevron}>▾</span>
                </div>
            </AccordionSection>

            {/* 分组：优先级 */}
            <AccordionSection title="优先级" defaultOpen>
                <div className={styles.selectLike}>
                    <select
                        value={data.priority ?? "none"}
                        onChange={(e) => onPriorityChange?.(e.target.value as any)}
                    >
                        <option value="none">啥都没有</option>
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                    </select>
                    <span className={styles.chevron}>▾</span>
                </div>
            </AccordionSection>

            {/* 分组：对话标记（标签） */}
            <AccordionSection title="对话标记" defaultOpen>
                <TagInput
                    tags={data.tags ?? []}
                    onAdd={onAddTag}
                    onRemove={onRemoveTag}
                />
            </AccordionSection>

            {/* 其它分组占位 */}
            <AccordionSection title="宏" />
            <AccordionSection title="对话信息" />
            <AccordionSection title="联系人属性" />
            <AccordionSection title="联系人备注" />
            <AccordionSection title="上一次对话" />
            <AccordionSection title="对话参与者" />
        </aside>
    );
}
