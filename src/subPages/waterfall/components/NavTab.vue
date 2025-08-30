<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  items?: NavItem[]
  defaultActive?: number
}>()

interface NavItem {
  label: string
  value: string
}

const navItems = ref<NavItem[]>(
  props.items || [
    { label: '基础', value: '/subPages/waterfall/Basic' },
    { label: '模拟', value: '/subPages/waterfall/Index' },
    { label: '列变', value: '/subPages/waterfall/Columns' },
    { label: '已知', value: '/subPages/waterfall/KnownSize' },
    { label: '删除', value: '/subPages/waterfall/Delete' },
    { label: '刷新', value: '/subPages/waterfall/Dynamic' },
    { label: '超时', value: '/subPages/waterfall/MaxWait' },
    { label: 'NO', value: '/subPages/waterfall/ReflowDemo' }
  ]
)

// 页面跳转方法
function navigateTo(url: string) {
  uni.navigateTo({
    url
  })
}
</script>

<template>
  <view class="nav-tab">
    <view v-for="(item, index) in navItems" :key="index" class="nav-item" @click="navigateTo(item.value)">
      <text class="nav-text">
        {{ item.label }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.nav-tab {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.25rem;
  margin: 0 0.125rem;
  transition: all 0.2s;
  cursor: pointer;
  background-color: #386fdf;
  min-width: 0;
  color: white;
  border-radius: 0.25rem;
}

.nav-item.active {
  background-color: #3b82f6;
  color: white;
}

.nav-item:hover {
  background-color: #e5e7eb;
}

.nav-item.active:hover {
  background-color: #2563eb;
}

.nav-text {
  font-size: 0.75rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.nav-item.active .nav-text {
  color: white;
}
</style>
