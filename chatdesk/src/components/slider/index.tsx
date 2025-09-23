import { NavLink } from 'react-router-dom'
import {
  IconX,
  IconCaptain,
  IconUsers,
  IconFolder,
  IconHashtag,
  IconChart,
  IconCalendar,
  IconBook,
  IconSettings,
} from '@/components/icon'
import s from './index.module.scss'

export default function Sidebar({
  onClose,
  compact = false,
}: {
  onClose?: () => void
  compact?: boolean
}) {
  return (
    <div className={`${s.sidebar} ${compact ? s.compact : ''}`}>
      {/* 头部 */}
      <div className={s.header}>
        <div className={s.brandDot} />
        {!compact && <span className={s.brandText}>si</span>}
        <div className={s.headerRight}>
          {!compact && <span className={s.headerHint}>我的收件箱</span>}
        </div>
        {onClose && (
          <button className={s.closeBtn} onClick={onClose} aria-label="关闭抽屉">
            <IconX className={s.icon} />
          </button>
        )}
      </div>

      {/* 导航 */}
      <nav className={s.nav}>
        <Section title={!compact ? '会话' : ''}>
          <NavItem to="/inbox/my" icon={<IconFolder className={s.icon} />} label="所有会话" compact={compact} />
          <NavItem to="/inbox/mentions" icon={<IconHashtag className={s.icon} />} label="提及" compact={compact} />
          <NavItem to="/inbox/unassigned" icon={<IconFolder className={s.icon} />} label="未处理" compact={compact} />
        </Section>

        <Section title={!compact ? '频道' : ''}>
          <Row icon={<IconFolder className={s.icon} />} label="家具销售" compact={compact} />
          <Row icon={<IconFolder className={s.icon} />} label="木材网站" compact={compact} />
          <Row icon={<IconHashtag className={s.icon} />} label="aichat" compact={compact} />
        </Section>

        <Section title={!compact ? '工具' : ''}>
          <NavItem to="/inbox/my" icon={<IconCaptain className={s.icon} />} label="Captain" compact={compact} />
          <NavItem to="/contacts" icon={<IconUsers className={s.icon} />} label="联系人" compact={compact} />
          <NavItem to="/reports" icon={<IconChart className={s.icon} />} label="报告" compact={compact} />
          <NavItem to="/activities" icon={<IconCalendar className={s.icon} />} label="活动" compact={compact} />
          <NavItem to="/help" icon={<IconBook className={s.icon} />} label="帮助中心" compact={compact} />
          <NavItem to="/settings" icon={<IconSettings className={s.icon} />} label="设置" compact={compact} />
        </Section>
      </nav>

      {/* 底部账户区 */}
      <div className={s.footer}>
        <div className={s.account}>
          <div className={s.avatar}>S</div>
          {!compact && (
            <div className={s.accountMeta}>
              <div className={s.accountName}>si</div>
              <div className={s.accountMail}>plobol525@hotmail.com</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------- 子项 ------- */

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className={s.section}>
      {title ? <div className={s.sectionTitle}>{title}</div> : null}
      <div className={s.sectionBody}>{children}</div>
    </div>
  )
}

function Row({ icon, label, compact }: { icon: React.ReactNode; label: string; compact?: boolean }) {
  return (
    <div className={s.rowWrap}>
      <div
        className={`${s.row} ${compact ? s.rowCompact : s.rowNormal}`}
        title={label}
        role="button"
        tabIndex={0}
      >
        {icon}
        {!compact && <span className={s.ellipsis}>{label}</span>}
      </div>
    </div>
  )
}

function NavItem({
  to,
  icon,
  label,
  compact,
}: {
  to: string
  icon?: React.ReactNode
  label: string
  compact?: boolean
}) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        [
          s.navItem,
          compact ? s.navItemCompact : s.navItemNormal,
          isActive ? s.active : '',
        ].join(' ')
      }
    >
      {icon}
      {!compact && <span className={s.ellipsis}>{label}</span>}
    </NavLink>
  )
}
