<template>
  <div class="track-item-preview-loading" v-loading="true" element-loading-background="rgba(255, 255, 255, 0.2)">
  </div>
</template>

<script setup lang="ts">
import "element-plus/theme-chalk/el-loading.css";
import { vLoading } from 'element-plus'

</script>

<style lang="scss" scoped>
.track-item-preview-loading {
  height: 100%;
  box-sizing: border-box;
  padding: 2px 6px;
  z-index: 0;
}
</style>