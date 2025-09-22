import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ResizablePaneGroupProps, Percent } from '@/components/resizable/type'
import styles from './index.module.scss'

interface DragState {
    active: boolean
    leftIndex: number // 手柄左侧 pane 的索引（右侧就是 leftIndex+1）
    startX: number
    startLeftSize: Percent
    startRightSize: Percent
    totalAB: Percent // startLeftSize + startRightSize
    containerWidthPx: number
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

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

    // 初始尺寸：传了用传的，否则均分
    const computedInitial = useMemo<Percent[]>(() => {
        if (initialSizes && initialSizes.length === count) {
            const sum = initialSizes.reduce((s, x) => s + x, 0)
            // 归一化到 100
            return initialSizes.map(x => (x / sum) * 100)
        }
        return Array.from({ length: count }, () => 100 / count)
    }, [initialSizes, count])

    // 最小尺寸：优先 props.minSizes，其次 Pane 自身 minSize，最后默认 10
    const computedMinSizes = useMemo<Percent[]>(() => {
        return panes.map((p, i) => {
            if (minSizes && typeof minSizes[i] === 'number') return minSizes[i]!
            const ms = (p.props as any).minSize
            return typeof ms === 'number' ? ms : 10
        })
    }, [panes, minSizes])

    const [sizes, setSizes] = useState<Percent[]>(computedInitial)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const dragRef = useRef<DragState>({
        active: false,
        leftIndex: -1,
        startX: 0,
        startLeftSize: 0,
        startRightSize: 0,
        totalAB: 0,
        containerWidthPx: 0
    })

    // 通知外部
    useEffect(() => {
        onSizesChange?.(sizes)
    }, [sizes, onSizesChange])

    // 开始拖拽（手柄位于 i 与 i+1 之间）
    const startDrag = useCallback((i: number, clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const state = dragRef.current
        state.active = true
        state.leftIndex = i
        state.startX = clientX
        state.startLeftSize = sizes[i]
        state.startRightSize = sizes[i + 1]
        state.totalAB = sizes[i] + sizes[i + 1]
        state.containerWidthPx = rect.width

        if (disableUserSelectOnDrag) {
            document.body.classList.add(styles.noselect)
        }
    }, [sizes, disableUserSelectOnDrag])

    const onMouseDownGutter = useCallback((i: number) => (e: React.MouseEvent) => {
        e.preventDefault()
        startDrag(i, e.clientX)
    }, [startDrag])

    const onTouchStartGutter = useCallback((i: number) => (e: React.TouchEvent) => {
        e.preventDefault()
        startDrag(i, e.touches[0].clientX)
    }, [startDrag])

    // 拖拽中
    const handleMove = useCallback((clientX: number) => {
        const state = dragRef.current
        if (!state.active) return

        const deltaPx = clientX - state.startX
        const deltaPercent = (deltaPx / state.containerWidthPx) * 100

        // 只调整左与右两个 Pane，其他保持不变
        const leftMin = computedMinSizes[state.leftIndex]
        const rightMin = computedMinSizes[state.leftIndex + 1]

        let newLeft = state.startLeftSize + deltaPercent
        // 不能小于 leftMin，也不能超过 AB-total 减去 rightMin
        newLeft = clamp(newLeft, leftMin, state.totalAB - rightMin)
        const newRight = state.totalAB - newLeft

        setSizes(prev => {
            const next = [...prev]
            next[state.leftIndex] = newLeft
            next[state.leftIndex + 1] = newRight
            return next
        })
    }, [computedMinSizes])

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

    return (
        <div className={styles.group} ref={containerRef}>
            {panes.map((pane, i) => {
                const basis = `${sizes[i]}%`
                return (
                    <React.Fragment key={i}>

                        <div
                            className="pane"
                            style={{ flexBasis: basis, width: basis } as React.CSSProperties}
                        >
                            {pane}
                        </div>


                        {i < count - 1 && (
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
            })}
        </div>
    )
}

export default ResizablePaneGroup
