import type { ReactElement } from "react";

export type Percent = number; // 0~100

export interface ResizablePaneProps {
  /**
   * 该 Pane 的最小宽度（百分比 0~100）
   * 默认 10
   */
  minSize?: Percent;
  /**
   * 测试或样式用的类名（会叠加到 Pane 容器上）
   */
  className?: string;
  /**
   * Pane 内容
   */
  children?: React.ReactNode;
}

export interface ResizablePaneGroupProps {
  children: ReactElement<ResizablePaneProps>[];
  /**
   * 各 Pane 初始宽度（百分比），长度与 children 一致。
   * 若不传，平均分配。
   */
  initialSizes?: Percent[];
  /**
   * 对应每个 Pane 的最小宽度（百分比）。不传则采用 Pane 自己的 minSize 或默认 10。
   */
  minSizes?: Percent[];
  /**
   * 拖拽手柄宽度（像素），默认 6
   */
  gutterSize?: number;
  /**
   * 拖拽时是否禁用文本选中，默认 true
   */
  disableUserSelectOnDrag?: boolean;
  /**
   * 尺寸变化回调（百分比数组）
   */
  onSizesChange?: (sizes: Percent[]) => void;
}
