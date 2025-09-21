
import { NavLink } from 'react-router-dom';

export default function Tabs() {
  const base = '/inbox'
  return (
    <div className="flex gap-6 border-b border-gray-100">
      <Tab to={`${base}/my`} label="我的" />
      <Tab to={`${base}/unassigned`} label="未分配的" />
      <Tab to={`${base}/all`} label="所有的" />
    </div>
  )
}

function Tab({ to, label }: { to: string, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'relative py-3 text-sm transition-colors ' +
        (isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800')
      }>
      {label}
      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">0</span>
    </NavLink>
  )
}