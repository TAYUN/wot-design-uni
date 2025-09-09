<script lang="ts" setup>
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'

import NavTab from './components/NavTab.vue'
import { mockImages } from './utils/mock'
import { type WaterfallExpose } from '@/uni_modules/wot-design-uni/components/wd-waterfall/types'
import { watch } from 'vue'

// api
interface ListItem {
  id: number
  url: string
}

const currentPage = ref(1)
const list = ref<ListItem[]>([])

let uuid = 1
const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))
async function fetchApi(page: number) {
  await sleep(300)
  const getList = () =>
    Array(12)
      .fill(0)
      .map((_, i) => {
        return {
          id: uuid++,
          url: mockImages[i % mockImages.length]
        }
      })

  return {
    page,
    total: 10,
    list: page > 10 ? [] : getList()
  }
}

// waterfall
const waterfallRef = ref<WaterfallExpose>()

// 下拉刷新
const refreshing = ref(false)

type LoadMoreState = 'loading' | 'error' | 'finished'
// 加载更多
const loadMoreStatus = ref<LoadMoreState>('loading')
// 监听下拉刷新
onPullDownRefresh(async () => {
  refreshing.value = true
  try {
    const res = await fetchApi(1)
    currentPage.value = 1
    list.value = res.list

    // 重置加载状态
    loadMoreStatus.value = res.page < res.total ? 'loading' : 'finished'

    // 刷新瀑布流布局
    waterfallRef.value?.refreshReflow()
  } catch (error) {
    console.log('刷新失败', error)
  } finally {
    refreshing.value = false
    // 停止下拉刷新动画
    uni.stopPullDownRefresh()
  }
})
onPullDownRefresh(() => {
  waterfallRef.value?.refreshReflow()
})

function loadMoreFetch(page: number) {
  loadMoreStatus.value = 'loading'
  fetchApi(page)
    .then((res) => {
      list.value = [...list.value, ...res.list]
      waterfallRef.value?.loadDone(() => {
        setTimeout(() => {
          loadMoreStatus.value = res.page < res.total ? 'loading' : 'finished'
        }, 300)
      })
    })
    .catch(() => {
      loadMoreStatus.value = 'error'
    })
}

function onReload() {
  if (!refreshing.value) {
    loadMoreFetch(currentPage.value)
  }
}

// 触底加载更多
onReachBottom(() => {
  if (waterfallRef.value?.loadStatus === 'busy') return
  if (!refreshing.value && loadMoreStatus.value === 'loading') {
    loadMoreFetch(++currentPage.value)
  }
})

onMounted(() => {
  loadMoreFetch(currentPage.value)
})

// 删除
function onDelete(item: ListItem, index: number) {
  list.value.splice(list.value.indexOf(item), 1)
  console.log('删除', index)
}

// 头部插入
function insertAtBeginning() {
  const newItem: ListItem = {
    id: uuid++,
    url: mockImages[Math.floor(Math.random() * mockImages.length)]
  }
  list.value.unshift(newItem)
}

// 中间插入
function insertAtMiddle() {
  const newItem: ListItem = {
    id: uuid++,
    url: mockImages[Math.floor(Math.random() * mockImages.length)]
  }
  const middleIndex = Math.floor(list.value.length / 2)
  list.value.splice(middleIndex, 0, newItem)
}

// 尾部插入
function insertAtEnd() {
  const newItem: ListItem = {
    id: uuid++,
    url: mockImages[Math.floor(Math.random() * mockImages.length)]
  }
  list.value.push(newItem)
}

// 随机插入
function insertRandom() {
  const newItem: ListItem = {
    id: uuid++,
    url: mockImages[Math.floor(Math.random() * mockImages.length)]
  }
  const randomIndex = Math.floor(Math.random() * (list.value.length + 1))
  list.value.splice(randomIndex, 0, newItem)
}

// 批量插入
function insertBatch() {
  const batchSize = 5
  const newItems: ListItem[] = Array(batchSize)
    .fill(0)
    .map(() => ({
      id: uuid++,
      url: mockImages[Math.floor(Math.random() * mockImages.length)]
    }))
  list.value.push(...newItems)
}

// 清空数据
function clearAll() {
  list.value = []
  currentPage.value = 1
  loadMoreStatus.value = 'loading'
}
</script>

<template>
  <view>
    <view class="button-row">
      <wd-button size="small" @click="insertAtBeginning">头部插入</wd-button>
      <wd-button size="small" @click="insertAtMiddle">中间插入</wd-button>
      <wd-button size="small" @click="insertAtEnd">尾部插入</wd-button>
      <wd-button size="small" @click="insertRandom">随机插入</wd-button>
      <wd-button size="small" @click="insertBatch">批量插入</wd-button>
      <wd-button size="small" @click="clearAll">清空数据</wd-button>
    </view>
    <wd-waterfall ref="waterfallRef" class="waterfall-container" error-mode="fallback">
      <wd-waterfall-item v-for="(item, index) in list" :key="item.id" :order="index" :id="item.id">
        <template v-slot:default="{ loaded }">
          <view class="waterfall-item">
            <image mode="widthFix" class="waterfall-image" :src="item.url" @load="loaded" @error="loaded" />
            <view class="delete-button">
              <wd-button size="large" type="error" @click="onDelete(item, index)">删除{{ index }}</wd-button>
            </view>
          </view>
        </template>
      </wd-waterfall-item>
    </wd-waterfall>

    <wd-loadmore :state="loadMoreStatus" @reload="onReload" />
    <view class="bottom-spacing" />
    <!-- 瀑布流演示导航 -->
    <NavTab />
  </view>
</template>

<style lang="scss" scoped>
.waterfall-container {
  margin-left: 8px;
  margin-right: 8px;
}

.waterfall-item {
  position: relative;
  overflow: hidden;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.waterfall-image {
  width: 100%;
}

.delete-button {
  position: absolute !important;
  right: 0;
  bottom: 0;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.bottom-spacing {
  padding: 40px;
}
</style>

<route lang="json">
{
  "name": "waterfall-case1",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "案例1",
    "enablePullDownRefresh ": true
  }
}
</route>
