<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'

import NavTab from './components/NavTab.vue'
import { mockImages, random, text } from './utils/mock'

interface ListItem {
  title: string
  url: string
}

const list = ref<ListItem[]>([])
const placeholderSrc = 'https://wot-ui.cn/logo.png'
function getData() {
  return new Promise<ListItem[]>((resolve) => {
    const data = Array(10)
      .fill(0)
      .map((_, i) => {
        const min = 20
        const max = 50
        const startIndex = random(0, text.length - max)
        const length = random(min, max)
        return {
          title: text.slice(startIndex, startIndex + length),
          url: mockImages[i % mockImages.length]
        }
      })
    resolve(data)
  })
}

function loadEnd() {
  console.log('加载结束')
}

onMounted(async () => {
  list.value.push(...(await getData()))
})

onReachBottom(async () => {
  list.value.push(...(await getData()))
})
</script>

<template>
  <view>
    <wd-waterfall class="waterfall-container" @load-end="loadEnd" error-mode="placeholder">
      <wd-waterfall-item v-for="(item, index) in list" :key="index">
        <template #default="{ loaded, errorInfo }">
          <view class="waterfall-item">
            <image v-if="errorInfo.status === 'none'" mode="widthFix" class="waterfall-image" :src="item.url" @load="loaded" @error="loaded" />
            <image
              v-else-if="errorInfo.status === 'fail'"
              mode="widthFix"
              class="waterfall-image"
              :src="placeholderSrc"
              @load="errorInfo.placeholder.load"
              @error="errorInfo.placeholder.error"
            />
            <view class="item-title">{{ item.title }}{{ errorInfo.status }}</view>
          </view>
        </template>
      </wd-waterfall-item>
    </wd-waterfall>

    <!-- 瀑布流演示导航 -->
    <view class="bottom-spacing" />
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
  display: flex;
}

.item-title {
  margin-top: 8px;
  font-size: 14.4px;
  line-height: 24px;
}

.bottom-spacing {
  padding: 40px;
}
</style>

<route lang="json">
{
  "name": "waterfall-truecase",
  "layout": "default",
  "style": {
    "navigationBarTitleText": "真实示例"
  }
}
</route>
