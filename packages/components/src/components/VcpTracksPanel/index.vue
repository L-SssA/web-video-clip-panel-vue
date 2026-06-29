<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { PixiHelper } from '@/utils/PixiHelper';

const tracksPanelRef = ref<HTMLElement | null>(null)
let pixiHelper: PixiHelper = new PixiHelper()

function setupPixi() {
  if (tracksPanelRef.value) {
    pixiHelper.init(tracksPanelRef.value, { backgroundAlpha: 0 })
  }
}

onMounted(() => {
  setupPixi()
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
