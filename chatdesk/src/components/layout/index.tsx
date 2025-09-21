import { useState, useEffect, useRef } from "react";
import { Outlet } from 'react-router-dom'
import Sidebar from "@/components/slider"
import TopBar from '@/components/topBar'

// 说明：
// 1) 桌面宽度（lg 及以上）：固定左侧边栏 + 主内容（对标第1张图）
// 2) 平板/小屏（sm~lg）：左侧边栏折叠为抽屉，点击左下角按钮呼出（对标第2张图）
// 3) 移动端（<sm）：全屏主内容 + 左下角悬浮汉堡按钮（对标第3张图）
// 使用 Tailwind 断点：sm=640, md=768, lg=1024


const STORAGE_KEY = 'inbox.sidebarWidth'
const DEFAULT_WIDTH = 260          // 展开时默认宽度
const MIN_WIDTH = 120              // 允许拖到的最小“真实宽度”（用于计算阈值）
const MAX_WIDTH = 420
const COMPACT_TRIGGER = 180        // 低于此阈值 => 进入仅图标模式
const COMPACT_WIDTH = 64           // 仅图标模式下实际视觉宽度

export default function SupportInboxLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false) // 小屏抽屉
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(saved) ? saved : DEFAULT_WIDTH
  })
  const isCompact = sidebarWidth < COMPACT_TRIGGER

  const [resizing, setResizing] = useState(false)
  const startXRef = useRef(0)
  const startWRef = useRef(sidebarWidth)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onMove = (e: any) => {
      if (!resizing) return


      const clientX = (e.touches?.[0]?.clientX) ?? e.clientX
      const delta = clientX - startXRef.current
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWRef.current + delta))
      setSidebarWidth(next)
    }
    const onUp = () => {
      if (!resizing) return
      setResizing(false)
      // 记住“展开宽度”（不是紧凑的 64）
      const toSave = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, sidebarWidth))
      localStorage.setItem(STORAGE_KEY, String(toSave))
      document.body.style.cursor = ''
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [resizing, sidebarWidth])

  const startResize = (e: any) => {
    const clientX = (e.touches?.[0]?.clientX) ?? e.clientX
    startXRef.current = clientX
    // 如果当前是紧凑状态，从阈值位置开始拖拽，便于直接放大
    startWRef.current = isCompact ? COMPACT_TRIGGER : sidebarWidth
    setResizing(true)
    document.body.style.cursor = 'col-resize'
  }

  const resetWidth = () => {
    setSidebarWidth(DEFAULT_WIDTH)
    localStorage.setItem(STORAGE_KEY, String(DEFAULT_WIDTH))
  }

  const visualSidebarWidth = isCompact ? COMPACT_WIDTH : sidebarWidth

  return (
    <div
      className={`h-screen w-screen bg-white text-gray-900 flex ${resizing ? 'select-none' : ''}`}
      style={{ userSelect: resizing ? 'none' : 'auto' }}
    >
      {/* 桌面左侧栏 */}
      <aside
        className="hidden lg:flex border-r border-gray-200 flex-col"
        style={{ width: visualSidebarWidth }}
      >
        <Sidebar compact={isCompact} />
      </aside>

      {/* 分割条（仅桌面） */}
      <div className="hidden lg:block relative" style={{ width: 1 }}>
        {/* 宽一点的可点击热区，易于抓手；双击重置 */}
        <div
          onMouseDown={startResize}
          onTouchStart={startResize}
          onDoubleClick={resetWidth}
          className="absolute top-0 -left-2 h-full w-5 cursor-col-resize"
          title="拖动以调整侧栏宽度（双击重置）"
        />
        <div className={`absolute inset-y-0 left-0 w-px ${resizing ? 'bg-blue-500/60' : 'bg-gray-200'}`} />
      </div>

      {/* 小屏抽屉 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-[78%] max-w-[320px] bg-white shadow-2xl border-r border-gray-200"
            onClick={(e) => e.stopPropagation()}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 主内容区：顶部左对齐 */}
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar onHamburger={() => setSidebarOpen(true)} />
        <div className="flex-1 px-6 lg:px-8 py-10 overflow-auto">
          <Outlet />
        </div>

        {/* 移动端悬浮按钮 */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed left-4 bottom-4 z-30 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 grid place-items-center"
          aria-label="打开侧边栏">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </main>
    </div>
  )
}