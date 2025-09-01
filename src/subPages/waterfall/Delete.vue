<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import NavTab from './components/NavTab.vue'
import { text } from './utils/mock'
import MockImage from './components/MockImage.vue'

interface DemoItem {
  id: number
  index: number
  title: string
  img: {
    width: number
    height: number
  }
}

const waterfallRef = ref()
const items = ref<DemoItem[]>([])
let nextId = 1

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
// 生成随机文本
function getRandomTitle() {
  const min = 10
  const max = 30
  const startIndex = random(0, text.length - max)
  const length = random(min, max)
  return text.slice(startIndex, startIndex + length)
}

// 生成随机图片尺寸
function getRandomImageSize() {
  return {
    width: random(100, 400),
    height: random(100, 400)
  }
}

// 添加项目
function addItem() {
  try {
    const newItem: DemoItem = {
      id: nextId++,
      index: items.value.length,
      title: getRandomTitle(),
      img: getRandomImageSize()
    }
    items.value.push(newItem)

    console.log('添加项目:', newItem)
    // 显示添加成功提示
  } catch (error) {
    console.error('添加项目失败:', error)
  }
}

// 批量添加项目
function batchAddItems(count: number = 5) {
  try {
    for (let i = 0; i < count; i++) {
      const newItem: DemoItem = {
        id: nextId++,
        index: items.value.length,
        title: getRandomTitle(),
        img: getRandomImageSize()
      }
      items.value.push(newItem)
    }

    console.log(`批量添加 ${count} 个项目`)
  } catch (error) {
    console.error('批量添加失败:', error)
  }
}

// 删除指定项目
async function removeItem(index: number) {
  try {
    // 从数据中移除
    const itemIndex = items.value.findIndex((item) => item.index === index)
    if (itemIndex !== -1) {
      // 从数据中移除项目
      items.value.splice(itemIndex, 1)
    } else {
      console.error('未找到要删除的项目，索引:', index)
    }
  } catch (error) {
    console.error('删除项目失败:', error)
  }
}

// 删除随机项目
function removeRandomItem() {
  if (items.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * items.value.length)
    const targetItem = items.value[randomIndex]
    removeItem(targetItem.index)
  }
}

// 清空所有项目
async function clearAll() {
  try {
    if (items.value.length === 0) {
      return
    }

    items.value = []
    await nextTick()
    waterfallRef.value?.refreshReflow()
  } catch (error) {
    console.error('清空失败:', error)
  }
}

// 瀑布流加载完成回调
function loadEnd() {}

// 添加占位图片地址
const placeholderSrc = 'https://wot-ui.cn/logo.png'

// 错误类型文本转换
function getErrorTypeText(status: string) {
  switch (status) {
    case 'fail':
      return '原始内容加载失败'
    case 'final':
      return '占位图片也加载失败'
    case 'timeout':
      return '加载超时'
    case 'phok':
      return '占位图片加载成功'
    default:
      return ''
  }
}

// 初始化数据
function initData() {
  const initialData: DemoItem[] = Array(6)
    .fill(0)
    .map((_, index) => ({
      id: nextId++,
      index,
      title: getRandomTitle(),
      img: getRandomImageSize()
    }))

  items.value = initialData
}

onMounted(async () => {
  initData()
})
</script>

<template>
  <view>
    <!-- 操作按钮区域 -->
    <view class="button-container">
      <wd-button size="small" @click="addItem">添加项目</wd-button>
      <wd-button size="small" @click="() => batchAddItems(5)">批量添加5个</wd-button>
      <wd-button size="small" @click="removeRandomItem">删除随机项目</wd-button>
      <wd-button size="small" @click="clearAll">清空所有</wd-button>
    </view>

    <!-- 瀑布流容器 -->
    <wd-waterfall
      ref="waterfallRef"
      :columns="2"
      :column-gap="10"
      :row-gap="10"
      error-mode="fallback"
      class="waterfall-container"
      @load-end="loadEnd"
    >
      <wd-waterfall-item v-for="item in items" :key="item.id" :index="item.index" class="waterfall-item">
        <template #default="{ loaded, errorInfo, key }">
          <view v-for="i in 1" :key="key + i">
            <!-- 第一层：原始内容 -->
            <MockImage v-if="errorInfo.status === 'none'" :meta="item.img" @load="loaded" />

            <!-- 第二层：占位图片 -->
            <view v-else-if="['fail', 'phok'].includes(errorInfo.status)" class="placeholder-container">
              <image
                :src="placeholderSrc"
                mode="aspectFill"
                class="placeholder-image"
                @load="errorInfo.placeholder.load"
                @error="errorInfo.placeholder.error"
              />
            </view>

            <!-- 第三层：最终兜底方案（占位图片失败或超时） -->
            <view v-else class="fallback-container">
              <view class="fallback-content">
                <text class="fallback-message">
                  {{ errorInfo.message || '图片加载失败' }}
                </text>
                <text>
                  {{ getErrorTypeText(errorInfo.status) }}
                </text>
              </view>
            </view>

            <!-- 其他内容始终显示 -->
            <view class="item-content">
              <view class="item-title">
                {{ item.title }}
              </view>
              <view class="item-info">
                <text class="info-text">ID: {{ item.id }}</text>
                <text class="info-text">Index: {{ item.index }}</text>
                <text v-if="errorInfo.status !== 'none'" class="error-text">错误: {{ errorInfo.status }}</text>
              </view>
              <wd-button size="small" type="error" @click="removeItem(item.index)">删除此项</wd-button>
            </view>
          </view>
        </template>
      </wd-waterfall-item>
    </wd-waterfall>

    <!-- 状态信息 -->
    <view class="status-container">
      <view class="status-item">
        <text class="status-text">当前项目数量: {{ items.length }}</text>
      </view>
      <view v-if="items.length > 0" class="status-item">
        <text class="status-text">项目索引: {{ items.map((item) => item.index).join(', ') }}</text>
      </view>
    </view>
    <view class="bottom-spacing" />
    <!-- 瀑布流演示导航 -->
    <NavTab />

    <!-- 瀑布流演示导航 -->
  </view>
</template>

<style lang="scss" scoped>
.button-container {
  display: flex;
  gap: 0.25rem;
}

.waterfall-container {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.waterfall-item {
  overflow: hidden;
  border-radius: 1rem;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.placeholder-container {
  height: 150px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
}

.placeholder-image {
  height: 100%;
  width: 100%;
  border-radius: 0.5rem;
  object-fit: cover;
}

.fallback-container {
  height: 150px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.fallback-content {
  text-align: center;
}

.fallback-message {
  margin-bottom: 0.5rem;
}

.item-content {
  background-color: white;
  padding: 0.5rem;
}

.item-title {
  margin-bottom: 0.5rem;
}

.item-info {
  display: flex;
  gap: 0.25rem;
  font-size: 12px;
}

.info-text {
  flex: none;
}

.error-text {
  color: #ef4444;
}

.status-container {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 1rem;
  background-color: #f9fafb;
  padding: 1.5rem;
}

.status-item {
  margin-bottom: 0.5rem;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }
}

.status-text {
  word-break: break-all;
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.bottom-spacing {
  padding: 2.5rem;
}
</style>

<route lang="json">
{
  "name": "waterfall-delete",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "删除"
  }
}
</route>
