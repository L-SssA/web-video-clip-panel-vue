<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { PixiHelper } from '@web-vcp/core';

const tracksPanelRef = ref<HTMLElement | null>(null)
let pixiHelper: PixiHelper = new PixiHelper()

async function setupPixi() {
  if (tracksPanelRef.value) {
    await pixiHelper.init(tracksPanelRef.value, { backgroundAlpha: 0 })
    await pixiHelper.renderBunny()
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
