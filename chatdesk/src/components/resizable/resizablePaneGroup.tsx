import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ResizablePaneGroupProps, Percent } from '@/components/resizable/type'
import styles from './index.module.scss'

interface DragState {
    active: boolean
    leftIndex: number // 手柄左侧 pane 的索引（右侧就是 leftIndex+1）
    startX: number
    containerWidthPx: number
    // 拖拽开始时的像素快照
    startWidthsPx: number[]
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

/**
 * 规则：
 * - 渲染时：最右侧 pane 使用 flex:1 1 auto（不设固定像素宽度），
 *   左侧[0..count-2]使用 flex:0 0 <px> 固定像素宽度。
 * - 因此当容器/浏览器 resize 时，只有最右侧 pane 宽度跟着变，左侧保持像素不变。
 * - 拖拽时：相邻两块在像素层面联动（左 <-> 右），并考虑各自 minSize（按挂载时容器宽度折算为像素）。
 * - 不使用 ResizeObserver 或 window.resize 监听。
 */
const ResizablePaneGroup: React.FC<ResizablePaneGroupProps> = ({
    children,
    initialSizes,
    minSizes,
    gutterSize = 6,
    disableUserSelectOnDrag = true,
    onSizesChange
}) => {
    const panes = React.Children.toArray(children) as React.ReactElement[]
    const count = panes.length
    const lastIdx = count - 1

    const containerRef = useRef<HTMLDivElement | null>(null)

    // ----- 初始化百分比 -----
    const computedInitialPerc = useMemo<Percent[]>(() => {
        if (initialSizes && initialSizes.length === count) {
            const sum = initialSizes.reduce((s, x) => s + x, 0)
            return initialSizes.map(x => (x / sum) * 100)
        }
        return Array.from({ length: count }, () => 100 / count)
    }, [initialSizes, count])

    // ----- 初始化/固定像素宽度（左侧 n-1 个）+ 右侧自适应 -----
    const [widthsPx, setWidthsPx] = useState<number[] | null>(null) // 长度 = count-1（不含最右）
    const [minPx, setMinPx] = useState<number[] | null>(null)       // 长度 = count（所有 pane 的最小像素）
    const [mounted, setMounted] = useState(false)

    // 仅在挂载时读取一次容器宽度，完成像素基准换算
    useEffect(() => {
        if (!containerRef.current || mounted) return
        const rect = containerRef.current.getBoundingClientRect()
        const cw = rect.width

        // 计算各 pane 的最小像素（来自 props.minSizes 或 pane.props.minSize，单位：百分比→像素）
        const minPercentList: number[] = panes.map((p, i) => {
            if (minSizes && typeof minSizes[i] === 'number') return minSizes[i]!
            const ms = (p.props as any).minSize
            return typeof ms === 'number' ? ms : 10
        })
        const minPixelList = minPercentList.map(ms => (ms / 100) * cw)

        // 初始百分比转像素
        const initPx = computedInitialPerc.map(p => (p / 100) * cw)

        // 左侧固定像素数组（不含最右 pane）
        const leftFixedPx = initPx.slice(0, lastIdx)

        setMinPx(minPixelList)
        setWidthsPx(leftFixedPx)
        setMounted(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, panes, minSizes, computedInitialPerc, lastIdx])

    // 向外回调：把当前“视觉占比”回传（用当前已知的像素基准推算）
    useEffect(() => {
        if (!onSizesChange || !widthsPx || !minPx || !containerRef.current) return
        const cw = containerRef.current.getBoundingClientRect().width
        // 左侧百分比
        const leftPerc = widthsPx.map(w => (w / cw) * 100)
        // 最右占比 = 100 - 左侧和
        const lastPerc = Math.max(0, 100 - leftPerc.reduce((s, x) => s + x, 0))
        const perc = [...leftPerc, lastPerc]
        onSizesChange(perc as Percent[])
    }, [widthsPx, minPx, onSizesChange])

    const dragRef = useRef<DragState>({
        active: false,
        leftIndex: -1,
        startX: 0,
        containerWidthPx: 0,
        startWidthsPx: []
    })

    const beginDrag = useCallback((i: number, clientX: number) => {
        if (!containerRef.current || !widthsPx) return
        const rect = containerRef.current.getBoundingClientRect()
        const state = dragRef.current
        state.active = true
        state.leftIndex = i
        state.startX = clientX
        state.containerWidthPx = rect.width
        state.startWidthsPx = widthsPx.slice() // 拖拽开始时的固定像素快照

        if (disableUserSelectOnDrag) {
            document.body.classList.add(styles.noselect)
        }
    }, [widthsPx, disableUserSelectOnDrag])

    const onMouseDownGutter = useCallback((i: number) => (e: React.MouseEvent) => {
        e.preventDefault()
        beginDrag(i, e.clientX)
    }, [beginDrag])

    const onTouchStartGutter = useCallback((i: number) => (e: React.TouchEvent) => {
        e.preventDefault()
        beginDrag(i, e.touches[0].clientX)
    }, [beginDrag])

    const handleMove = useCallback((clientX: number) => {
        const state = dragRef.current
        if (!state.active || !widthsPx || !minPx) return

        const i = state.leftIndex
        const deltaPx = clientX - state.startX

        // 我们需要更新的是：
        // - 若 i+1 < lastIdx：左侧两个固定 pane（i 和 i+1）像素联动，最右 pane自动吸收总变化；
        // - 若 i+1 == lastIdx：仅更新 i（左固定），最右 pane自动吸收变化。
        const next = state.startWidthsPx.slice()

        // 取各自最小像素
        const leftMin = minPx[i]
        const rightMin = minPx[i + 1]

        if (i + 1 < lastIdx) {
            // 调整 i 与 i+1 两个“固定像素 pane”
            let newLeft = state.startWidthsPx[i] + deltaPx
            let newRight = state.startWidthsPx[i + 1] - deltaPx

            newLeft = Math.max(leftMin, newLeft)
            newRight = Math.max(rightMin, newRight)

            // 若两侧都已触底，无法再拖
            const lockLeft = newLeft === leftMin && deltaPx < 0
            const lockRight = newRight === rightMin && deltaPx > 0
            if (lockLeft || lockRight) return

            next[i] = newLeft
            next[i + 1] = newRight
            setWidthsPx(next)
        } else {
            // i+1 == lastIdx，右边是“自适应 pane”，只需要更新 i 的固定像素
            let newLeft = state.startWidthsPx[i] + deltaPx
            newLeft = Math.max(leftMin, newLeft)
            // 还需保证最右自适应 pane >= minPx[lastIdx]
            if (containerRef.current) {
                const cw = state.containerWidthPx
                // 固定部分总和 = sum(next except last)（注意本轮仅 i 变）
                const fixedSumExceptI = next.reduce((s, x, idx) => (idx === i ? s : s + x), 0)
                const lastWidth = cw - (fixedSumExceptI + newLeft)
                if (lastWidth < minPx[lastIdx]) {
                    // 不能再扩大 i：保持边界即可
                    return
                }
            }
            next[i] = newLeft
            setWidthsPx(next)
        }
    }, [widthsPx, minPx, lastIdx])

    const onMouseMove = useCallback((e: MouseEvent) => {
        e.preventDefault()
        handleMove(e.clientX)
    }, [handleMove])

    const onTouchMove = useCallback((e: TouchEvent) => {
        handleMove(e.touches[0].clientX)
    }, [handleMove])

    const endDrag = useCallback(() => {
        const state = dragRef.current
        if (!state.active) return
        state.active = false
        if (disableUserSelectOnDrag) {
            document.body.classList.remove(styles.noselect)
        }
    }, [disableUserSelectOnDrag])

    const onMouseUp = useCallback(() => endDrag(), [endDrag])
    const onTouchEnd = useCallback(() => endDrag(), [endDrag])

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

    // 尚未完成挂载像素基准时，不渲染（避免闪烁，也可用 skeleton）
    if (!mounted || !widthsPx || !minPx) {
        return <div className={styles.group} ref={containerRef} />
    }

    return (
        <div className={styles.group} ref={containerRef}>
            {panes.map((pane, i) => {
                if (i < lastIdx) {
                    // 左侧：固定像素
                    const w = widthsPx[i]
                    return (
                        <React.Fragment key={i}>
                            <div
                                className="pane"
                                style={{ flex: `0 0 ${w}px`, width: `${w}px` } as React.CSSProperties}
                            >
                                {pane}
                            </div>

                            {i < lastIdx && (
                                <div
                                    className={styles.gutter}
                                    style={{ width: `${gutterSize}px` }}
                                    onMouseDown={onMouseDownGutter(i)}
                                    onTouchStart={onTouchStartGutter(i)}
                                    role="separator"
                                    aria-orientation="vertical"
                                    aria-label={`Resize between pane ${i + 1} and ${i + 2}`}
                                />
                            )}
                        </React.Fragment>
                    )
                } else {
                    // 最右：自适应（不设固定像素）
                    return (
                        <div
                            key={i}
                            className="pane"
                            style={{ flex: '1 1 auto', minWidth: `${minPx[i]}px` } as React.CSSProperties}
                        >
                            {pane}
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default ResizablePaneGroup
