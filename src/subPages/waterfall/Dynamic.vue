<script lang="ts" setup>
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'

import NavTab from './components/NavTab.vue'
import { mockImages } from './utils/mock'
import { type WaterfallExpose } from '@/uni_modules/wot-design-uni/components/wd-waterfall/types'

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
  if (!refreshing.value && loadMoreStatus.value === 'loading') {
    loadMoreFetch(++currentPage.value)
  }
})

onMounted(() => {
  loadMoreFetch(currentPage.value)
})

// 删除
function onDelete(item: ListItem) {
  list.value.splice(list.value.indexOf(item), 1)
}
</script>

<template>
  <view title="结合下拉刷新与触底加载">
    <wd-waterfall ref="waterfallRef" class="waterfall-container" :column-gap="10" :row-gap="4">
      <wd-waterfall-item v-for="item in list" :key="item.id">
        <template #default="{ loaded }">
          <view class="waterfall-item">
            <image mode="widthFix" class="waterfall-image" :src="item.url" @load="loaded" @error="loaded" />
            <view class="delete-button">
              <wd-button size="small" type="error" @click="onDelete(item)">删除</wd-button>
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
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.waterfall-item {
  position: relative;
}

.waterfall-image {
  width: 100%;
  display: flex;
}

.delete-button {
  position: absolute !important;
  right: 0;
  bottom: 0;
}

.bottom-spacing {
  padding: 2.5rem;
}
</style>

<route lang="json">
{
  "name": "waterfall-refresh",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "下拉刷新与触底加载",
    "enablePullDownRefresh ": true
  }
}
</route>
