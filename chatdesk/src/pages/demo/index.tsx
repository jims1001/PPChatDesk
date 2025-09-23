import React, { useState } from 'react'
import ResizablePaneGroup from '@/components/resizable/resizablePaneGroup'
import ResizablePane from '@/components/resizable/resizablePane'
import Sidebar from '@/components/slider'
import { Outlet } from "react-router-dom";

export default function App() {
    const [sizes, setSizes] = useState<number[]>([25, 50, 25])

    return (
        <>
            <div className="demo-title">
                <strong>ResizablePaneGroup Demo</strong>
                <span style={{ marginLeft: 12, color: '#666' }}>
                    当前宽度：[{sizes.map(s => s.toFixed(1)).join('% , ')}%]
                </span>
            </div>

            <ResizablePaneGroup
                initialSizes={[25, 50, 25]}
                minSizes={[12, 15, 12]} // A/B/C 各自的最小宽度（百分比）
                onSizesChange={setSizes}
            >
                <ResizablePane className="pane-a">
                    <aside
                        className="hidden lg:flex border-r border-gray-200 flex-col"

                    >
                        <Sidebar compact={false} />
                    </aside>

                </ResizablePane>

                <ResizablePane className="pane-b">
                    <div className="pane-inner">
                        <Outlet />   {/* 这里渲染子路由内容 */}
                    </div>
                </ResizablePane>

                <ResizablePane className="pane-c">
                    <div className="pane-inner">
                        <h3>C 面板（可拖左侧手柄，影响 B/C）</h3>
                        <p>放详情/信息面板等。</p>
                    </div>
                </ResizablePane>
            </ResizablePaneGroup>
        </>
    )
}
