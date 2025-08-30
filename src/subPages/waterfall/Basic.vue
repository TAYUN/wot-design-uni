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

function loadEnd() {}

onMounted(async () => {
  list.value.push(...(await getData()))
})

onReachBottom(async () => {
  list.value.push(...(await getData()))
})
</script>

<template>
  <view>
    <wd-waterfall class="waterfall-container" @load-end="loadEnd">
      <wd-waterfall-item v-for="(item, index) in list" :key="index">
        <template #default="{ loaded }">
          <image mode="widthFix" class="waterfall-image" :src="item.url" @load="loaded" @error="loaded" />
          <view class="item-title">
            {{ item.title }}
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
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.waterfall-image {
  width: 100%;
  display: flex;
}

.item-title {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5rem;
}

.bottom-spacing {
  padding: 2.5rem;
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
