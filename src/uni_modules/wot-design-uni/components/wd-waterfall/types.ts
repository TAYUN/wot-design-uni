/*
 * @Author: weisheng
 * @Date: 2025-01-20 00:00:00
 * @LastEditTime: 2025-01-20 00:00:00
 * @LastEditors: weisheng
 * @Description: wd-waterfall 瀑布流组件类型定义
 * @FilePath: /wot-design-uni/src/uni_modules/wot-design-uni/components/wd-waterfall/types.ts
 * 记得注释
 */

import type { ExtractPropTypes, InjectionKey } from 'vue'
import type { WaterfallItemInfo } from '../wd-waterfall-item/types'
import { baseProps } from '../common/props'

/**
 * 瀑布流组件属性
 */
export const waterfallProps = {
  /**
   * 列数
   */
  columns: {
    type: Number,
    default: 2
  },
  /**
   * 列间距（px）
   */
  columnGap: {
    type: Number,
    default: 8
  },
  /**
   * 行间距（px）
   */
  rowGap: {
    type: Number,
    default: 8
  },
  /**
   * 是否显示
   */
  show: {
    type: Boolean,
    default: undefined
  },
  ...baseProps,
}

/**
 * 瀑布流组件属性类型
 */
export type WaterfallProps = ExtractPropTypes<typeof waterfallProps>

/**
 * 瀑布流组件默认属性
 */
export const defaultWaterfallProps: Partial<WaterfallProps> = {
  columns: 2,
  columnGap: 8,
  rowGap: 8
}

/**
 * 瀑布流组件插槽
 */
export interface WaterfallSlots {
  /**
   * 默认插槽
   */
  default(): any
}

/**
 * 瀑布流组件事件
 */
export interface WaterfallEmits {
  /**
   * 加载开始事件
   */
  (e: 'loadStart'): void
  /**
   * 加载结束事件
   */
  (e: 'loadEnd'): void
  /**
   * 显示状态更新事件
   */
  (e: 'update:show', value: boolean): void
}

/**
 * 瀑布流组件暴露的方法
 */
export interface WaterfallExpose {
  /**
   * 完整重排（重置所有状态）
   */
  reflow: () => void
  /**
   * 刷新重排（重置所有状态，包括数据）
   */
  refreshReflow: () => void
  /**
   * 注册加载完成回调
   */
  loadDone: (handler: () => void) => void
}

/**
 * 瀑布流上下文
 */
export interface WaterfallContext {
  /**
   * 添加项目
   */
  addItem: (item: WaterfallItemInfo) => void
  /**
   * 移除项目
   */
  removeItem: (item: WaterfallItemInfo) => void
  /**
   * 项目加载完成回调
   */
  onItemLoad: (item: WaterfallItemInfo) => void
  /**
   * 列宽度（响应式）
   */
  columnWidth: number
  /**
   * 全局重排状态（响应式）
   */
  isReflowing: boolean
  /**
   * 排版中断状态（响应式）
   */
  isLayoutInterrupted: boolean
}

/**
 * 瀑布流上下文注入键
 */
export const waterfallContextKey: InjectionKey<WaterfallContext> = Symbol('waterfallContext')