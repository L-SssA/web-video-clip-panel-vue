<template>
  <div class="track-item-previews">
    <TrackItemLoading v-if="data.loading" />
    <VideoTrackItemPreview v-else-if="data.type === 'video'" :data="data">
    </VideoTrackItemPreview>
    <AudioTrackItemPreview v-else-if="data.type === 'audio'" :data="data">
    </AudioTrackItemPreview>
    <ImageTrackItemPreview v-else-if="data.type === 'image'" :data="data">
    </ImageTrackItemPreview>
  </div>
</template>

<script setup lang="ts">
import type { TrackItem } from "@web-vcp/core";

import TrackItemLoading from "@/components/TrackItemPreview/TrackItemLoading.vue";
import VideoTrackItemPreview from "@/components/TrackItemPreview/VideoTrackItemPreview.vue";
import AudioTrackItemPreview from "@/components/TrackItemPreview/AudioTrackItemPreview.vue";
import ImageTrackItemPreview from "@/components/TrackItemPreview/ImageTrackItemPreview.vue";

const props = defineProps({
  data: {
    type: Object as () => TrackItem,
    required: true
  }
}) 
</script>

<style scoped lang="scss">
.track-item-previews {
  height: calc(100% - 20px);
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}
</style>