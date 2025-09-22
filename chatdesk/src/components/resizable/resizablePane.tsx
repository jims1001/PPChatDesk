import React from 'react'
import type { ResizablePaneProps } from '@/components/resizable/type'
import styles from './index.module.scss'

const ResizablePane: React.FC<ResizablePaneProps> = ({ className, children }) => {
    return (
        <div className={`${styles.pane} ${className ?? ''}`}>
            {children}
        </div>
    )
}

ResizablePane.displayName = 'ResizablePane'


export default ResizablePane as React.FC<ResizablePaneProps> & { defaultProps: { minSize: number } };
