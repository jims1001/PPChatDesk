
import { IconMenu, IconFilter, IconMore } from '@/components/icon'
export default function TopBar({ onHamburger }: { onHamburger: () => void }) {
  return (
    <div className="flex items-center gap-2 h-14 px-4 lg:px-6 border-b border-gray-200">
      <button onClick={onHamburger} className="lg:hidden rounded-md p-2 hover:bg-gray-100" aria-label="打开侧边栏">
        <IconMenu className="h-5 w-5" />
      </button>
      <div className="font-medium">会话</div>
      <span className="ml-2 text-[11px] rounded bg-gray-100 px-1.5 py-0.5">打开</span>
      <div className="ml-auto flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-gray-100" aria-label="过滤">
          <IconFilter className="h-5 w-5" />
        </button>
        <button className="rounded-md p-2 hover:bg-gray-100" aria-label="更多">
          <IconMore className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}