<script>
/** 无渲染组件，用于解决小程序的插key更新，不重新渲染的问题 */
// 不需要任何 props、data、生命周期
export default {
  name: 'wd-slot-wrapper',
  options: {
    // 小程序专用：强制当成自定义组件
    virtualHost: false, // uni-app 默认就是 false，可不写
    addGlobalClass: true,
    styleIsolation: 'shared',
    multipleSlots: true // 保险起见，支持多插槽
  }
}
</script>
<script setup>
import { onUnmounted } from 'vue'

onUnmounted(() => {
  console.log('无渲染组件销毁')
})
</script>
<template>
  <!-- 直接把插槽透传出来 -->
  <slot />
</template>
