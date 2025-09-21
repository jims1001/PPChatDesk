
import { IconChat } from '@/components/icon'
export default function EmptyState({ text = '您的收件箱中似乎没有客户的消息。' }) {
  return (
    <div className="max-w-xl text-left">
      <div className="mb-6 h-24 w-24 md:h-28 md:w-28 rounded-full bg-blue-50 grid place-items-center">
        <div className="h-12 w-12 text-blue-500">
          <IconChat className="h-full w-full" />
        </div>
      </div>
      <div className="text-gray-600">{text}</div>
      <div className="mt-4 flex items-center justify-start gap-3 text-xs text-gray-400">
        <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5">⌘</kbd>
        <span>K 打开命令菜单</span>
        <span>·</span>
        <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5">⌘</kbd>
        <span>/ 查看键盘快捷键</span>
      </div>
    </div>
  )
}