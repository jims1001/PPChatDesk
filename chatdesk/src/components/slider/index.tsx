
import { IconX, IconCaptain, IconUsers, IconFolder, IconHashtag, IconChart, IconCalendar, IconBook, IconSettings } from '@/components/icon'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ onClose, compact = false }: { onClose?: () => void, compact?: boolean }) {
  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className={`flex items-center gap-2 h-14 border-b border-gray-200 ${compact ? 'px-2' : 'px-4'}`}>
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        {!compact && <span className="font-medium">si</span>}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          {!compact && <span>我的收件箱</span>}
        </div>
        {onClose && (
          <button className="ml-2 rounded-md p-1 hover:bg-gray-100" onClick={onClose} aria-label="关闭抽屉">
            <IconX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto p-2">
        <Section title={!compact ? '会话' : ''}>
          <NavItem to="/inbox/my" icon={<IconFolder />} label="所有会话" compact={compact} />
          <NavItem to="/inbox/mentions" icon={<IconHashtag />} label="提及" compact={compact} />
          <NavItem to="/inbox/unassigned" icon={<IconFolder />} label="未处理" compact={compact} />
        </Section>

        <Section title={!compact ? '频道' : ''}>
          <Row icon={<IconFolder />} label="家具销售" compact={compact} />
          <Row icon={<IconFolder />} label="木材网站" compact={compact} />
          <Row icon={<IconHashtag />} label="aichat" compact={compact} />
        </Section>

        <Section title={!compact ? '工具' : ''}>
          <NavItem to="/inbox/my" icon={<IconCaptain />} label="Captain" compact={compact} />
          <NavItem to="/contacts" icon={<IconUsers />} label="联系人" compact={compact} />
          <NavItem to="/reports" icon={<IconChart />} label="报告" compact={compact} />
          <NavItem to="/activities" icon={<IconCalendar />} label="活动" compact={compact} />
          <NavItem to="/help" icon={<IconBook />} label="帮助中心" compact={compact} />
          <NavItem to="/settings" icon={<IconSettings />} label="设置" compact={compact} />
        </Section>
      </nav>

      {/* 底部账户区 */}
      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-emerald-500 grid place-items-center text-white text-[10px]">S</div>
          {!compact && (
            <div className="min-w-0">
              <div className="truncate">si</div>
              <div className="truncate text-gray-400">plobol525@hotmail.com</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------- 子项 ------- */

function Section({ title, children }: { title?: string, children: React.ReactNode }) {
  return (
    <div className="mb-3">
      {title ? <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-400">{title}</div> : null}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ icon, label, compact }: { icon: React.ReactNode, label: string, compact?: boolean }) {
  return (
    <div className="px-2">
      <div className={`flex items-center ${compact ? 'justify-center p-2' : 'gap-2 px-2 py-2'} text-gray-700`} title={label}>
        {icon}
        {!compact && <span className="truncate">{label}</span>}
      </div>
    </div>
  )
}

function NavItem({ to, icon, label, compact }: { to: string, icon?: React.ReactNode, label: string, compact?: boolean }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        (compact
          ? 'w-full grid place-items-center rounded-md p-2'
          : 'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ') +
        (isActive ? ' bg-blue-50 text-blue-700' : ' hover:bg-gray-100 text-gray-700')
      }
    >
      {icon}
      {!compact && <span className="truncate">{label}</span>}
    </NavLink>
  )
}