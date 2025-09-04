<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { type WaterfallItem, useWaterfallReflow } from './utils/use-waterfall-reflow'
import NavTab from './components/NavTab.vue'
import { getRect } from '@/uni_modules/wot-design-uni/components/common/util'

// 响应式数据
const containerRef = ref()
const containerWidth = ref(375)
const columns = ref(2)
const columnGap = ref(10)
const rowGap = ref(10)
const reflowTime = ref(0)
const loadingItems = ref(new Set<string | number>()) // 正在加载的项目ID
const instance = getCurrentInstance()

// 初始数据
const items = ref<WaterfallItem[]>([])

// 使用瀑布流重排 hook
const {
  layoutItems,
  containerHeight,
  // isInitialized,
  initialize,
  appendItem,
  insertItem,
  removeItem,
  batchUpdate
} = useWaterfallReflow({
  containerWidth,
  columns,
  columnGap,
  rowGap
})

// 生成随机项目（同步版本，用于初始化）
// const generateRandomItem = (id: string | number): WaterfallItem => {
//   const width = 200 + Math.random() * 100 // 200-300px
//   const height = 150 + Math.random() * 200 // 150-350px
//   return { id, width, height }
// }

// 生成随机项目（异步版本，模拟图片加载延迟）
async function generateRandomItemAsync(id: string | number): Promise<WaterfallItem> {
  // 模拟网络延迟 500-2000ms
  const delay = 500 + Math.random() * 1500
  await new Promise((resolve) => setTimeout(resolve, delay))

  const width = 200 + Math.random() * 100 // 200-300px
  const height = 150 + Math.random() * 200 // 150-350px
  return { id, width, height }
}

// 生成初始数据（异步版本）
async function generateInitialItems(): Promise<WaterfallItem[]> {
  const itemIds = Array.from({ length: 20 }, (_, i) => i + 1)

  // 添加所有初始项目到加载状态
  itemIds.forEach((id) => loadingItems.value.add(id))

  try {
    // 并发生成所有初始项目
    const items = await Promise.all(itemIds.map((id) => generateRandomItemAsync(id)))
    return items
  } finally {
    // 清除所有加载状态
    itemIds.forEach((id) => loadingItems.value.delete(id))
  }
}

// 获取项目颜色
function getItemColor(id: string | number): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  const index = typeof id === 'number' ? id : Number.parseInt(id.toString())
  return colors[index % colors.length]
}

// 测量重排性能
function measureReflowTime(fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()
  reflowTime.value = Math.round((end - start) * 100) / 100
}

// 事件处理
function onColumnsChange(e: any) {
  measureReflowTime(() => {
    columns.value = e.detail.value
  })
}

function onColumnGapChange(e: any) {
  measureReflowTime(() => {
    columnGap.value = e.detail.value
  })
}

function onRowGapChange(e: any) {
  measureReflowTime(() => {
    rowGap.value = e.detail.value
  })
}

async function addRandomItem() {
  const newId = Math.max(...items.value.map((item) => Number(item.id))) + 1

  // 添加到加载状态
  loadingItems.value.add(newId)

  try {
    const newItem = await generateRandomItemAsync(newId)

    measureReflowTime(() => {
      items.value.push(newItem)
      appendItem(newItem)
    })
  } finally {
    // 移除加载状态
    loadingItems.value.delete(newId)
  }
}

async function insertRandomItem() {
  if (items.value.length === 0) return

  const insertIndex = Math.floor(Math.random() * items.value.length)
  const newId = Math.max(...items.value.map((item) => Number(item.id))) + 1

  // 添加到加载状态
  loadingItems.value.add(newId)

  try {
    const newItem = await generateRandomItemAsync(newId)

    measureReflowTime(() => {
      items.value.splice(insertIndex, 0, newItem)
      insertItem(insertIndex, newItem)
    })
  } finally {
    // 移除加载状态
    loadingItems.value.delete(newId)
  }
}

function removeRandomItem() {
  if (items.value.length === 0) return

  const removeIndex = Math.floor(Math.random() * items.value.length)
  const itemToRemove = items.value[removeIndex]

  measureReflowTime(() => {
    items.value.splice(removeIndex, 1)
    removeItem(itemToRemove.id)
  })
}

async function batchAddItems() {
  const batchSize = 5
  const startId = Math.max(...items.value.map((item) => Number(item.id))) + 1
  const newIds = Array.from({ length: batchSize }, (_, i) => startId + i)

  // 添加所有项目到加载状态
  newIds.forEach((id) => loadingItems.value.add(id))

  try {
    // 并发生成所有项目
    const newItems = await Promise.all(newIds.map((id) => generateRandomItemAsync(id)))

    measureReflowTime(() => {
      items.value.push(...newItems)
      batchUpdate(
        newItems.map((item) => ({
          type: 'append' as const,
          data: { item }
        }))
      )
    })
  } finally {
    // 移除所有加载状态
    newIds.forEach((id) => loadingItems.value.delete(id))
  }
}

async function resetItems() {
  try {
    const newItems = await generateInitialItems()

    measureReflowTime(() => {
      items.value = newItems
      initialize(newItems)
    })
  } catch (error) {
    console.error('重置项目失败:', error)
  }
}

// 获取容器宽度
async function updateContainerWidth() {
  if (containerRef.value) {
    const rect = await getRect('.waterfall-container', false, instance?.proxy)
    containerWidth.value = rect?.width || 0
  }
}

// 初始化
onMounted(async () => {
  await nextTick()
  updateContainerWidth()

  try {
    const initialItems = await generateInitialItems()
    items.value = initialItems
    initialize(initialItems)
  } catch (error) {
    console.error('初始化失败:', error)
  }
})
</script>

<template>
  <view class="page-container">
    <view class="content-section">
      <text class="section-title">测试公式(非组件)-容器参数无变化，如纯图片</text>
      <view class="controls-container">
        <view class="control-group">
          <text>列数: {{ columns }}</text>
          <slider :value="columns" :min="1" :max="5" :step="1" @change="onColumnsChange" />
        </view>
        <view class="control-group">
          <text>列间距: {{ columnGap }}px</text>
          <slider :value="columnGap" :min="0" :max="30" :step="2" @change="onColumnGapChange" />
        </view>
        <view class="control-group">
          <text>行间距: {{ rowGap }}px</text>
          <slider :value="rowGap" :min="0" :max="30" :step="2" @change="onRowGapChange" />
        </view>
      </view>

      <view class="button-container">
        <wd-button size="small" :disabled="loadingItems.size > 0" @click="addRandomItem">
          {{ loadingItems.size > 0 ? '加载中...' : '添加随机项' }}
        </wd-button>
        <wd-button size="small" :disabled="loadingItems.size > 0" @click="insertRandomItem">
          {{ loadingItems.size > 0 ? '加载中...' : '插入随机项' }}
        </wd-button>
        <wd-button size="small" @click="removeRandomItem">删除随机项</wd-button>
        <wd-button size="small" :disabled="loadingItems.size > 0" @click="batchAddItems">
          {{ loadingItems.size > 0 ? '加载中...' : '批量添加' }}
        </wd-button>
        <wd-button size="small" :disabled="loadingItems.size > 0" @click="resetItems">
          {{ loadingItems.size > 0 ? '加载中...' : '重置' }}
        </wd-button>
      </view>

      <view class="demo-stats">
        <text>项目数量: {{ items.length }}</text>
        <text>容器高度: {{ Math.round(containerHeight) }}px</text>
        <text>重排耗时: {{ reflowTime }}ms</text>
        <text v-if="loadingItems.size > 0" class="loading-text">加载中: {{ loadingItems.size }}项</text>
      </view>
    </view>

    <!-- 加载指示器 -->
    <view v-if="loadingItems.size > 0" class="loading-indicator">
      <view class="loading-spinner" />
      <text>正在加载 {{ loadingItems.size }} 个项目...</text>
    </view>

    <view ref="containerRef" class="waterfall-container" :style="{ height: `${containerHeight}px` }">
      <view
        v-for="layoutItem in layoutItems"
        :key="layoutItem.id"
        class="waterfall-item"
        :style="{
          position: 'absolute',
          left: `${layoutItem.left}px`,
          top: `${layoutItem.top}px`,
          width: `${layoutItem.width}px`,
          height: `${layoutItem.height}px`
        }"
      >
        <view class="item-content">
          <view class="item-image" :style="{ backgroundColor: getItemColor(layoutItem.id) }">
            <text class="item-id">
              {{ layoutItem.id }}
            </text>
          </view>
          <view class="item-info">
            <text class="item-size">{{ Math.round(layoutItem.width) }}×{{ Math.round(layoutItem.height) }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="bottom-spacing" />
    <!-- 瀑布流演示导航 -->
    <NavTab />
  </view>
</template>

<route lang="json">
{
  "name": "waterfall-nodom",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "dom"
  }
}
</route>

<style lang="scss" scoped>
.page-container {
  margin-left: 8px;
  margin-right: 8px;
}

.content-section {
  margin-bottom: 8px;
}

.section-title {
  font-weight: 500;
}

.controls-container {
  margin-bottom: 8px;
}

.button-container {
  display: flex;
  gap: 4px;
}

.bottom-spacing {
  padding: 40px;
}

.control-group {
  display: flex;
  align-items: center;
  margin-bottom: 7.5px;

  text {
    width: 100px;
    font-size: 14px;
    color: #666;
  }

  slider {
    flex: 1;
    margin-left: 10px;
  }
}

.demo-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;

  text {
    flex: 1;
    text-align: center;
  }

  .loading-text {
    color: #007aff;
    font-weight: bold;
  }
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #f0f8ff;
  border: 1px solid #007aff;
  border-radius: 6px;
  color: #007aff;
  font-size: 14px;

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e3f2fd;
    border-top: 2px solid #007aff;
    border-radius: 50%;
    margin-right: 7.5px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.waterfall-container {
  position: relative;
  width: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}

.waterfall-item {
  position: relative;
  overflow: hidden;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.item-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.item-id {
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.3);
}

.item-info {
  padding: 4px;
  background: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.item-size {
  font-size: 10px;
  color: #666;
}
</style>
