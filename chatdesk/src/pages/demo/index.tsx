import React, { useState } from 'react'
import ResizablePaneGroup from '@/components/resizable/resizablePaneGroup'
import ResizablePane from '@/components/resizable/resizablePane'

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
                    <div className="pane-inner">
                        <h3>A 面板（可拖右侧手柄，影响 A/B）</h3>
                        <p>放导航/列表/树等。</p>
                    </div>
                </ResizablePane>

                <ResizablePane className="pane-b">
                    <div className="pane-inner">
                        <h3>B 面板（左右手柄都可拖，影响 A/B 或 B/C）</h3>
                        <p>主区域内容。</p>
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
