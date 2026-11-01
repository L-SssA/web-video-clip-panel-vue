<template>
  <div ref="VideoClipCanvasRef" class="video-clip-canvas">
    <KStage :config="stageSize" @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
      <KLayer>
        <KImage v-for="frameData in tickFrames" :key="frameData.id" :config="{
          image: frameData.video,
          id: frameData.id,
          x: frameData.x,
          y: frameData.y,
          width: frameData.width,
          height: frameData.height,
          rotation: frameData.rotation,
          scaleX: frameData.scaleX,
          scaleY: frameData.scaleY,
          draggable: playState === 'paused'
        }" @transformend="handleTransformEnd" @dragend="handleTransformEnd" />
        <KTransformer :config="{ rotateMode: 'corners' }" ref="TransformerRef" />
      </KLayer>
    </KStage>
  </div>
</template>

<script setup lang="ts">
import { WebVcpManager } from '@web-vcp/core';
import type { KonvaEventObject, Node } from 'konva/lib/Node';
import type { Stage } from 'konva/lib/Stage';
import { onMounted, reactive, ref } from 'vue';
import { Stage as KStage, Layer as KLayer, Image as KImage, Transformer as KTransformer } from 'vue-konva';

const props = defineProps({
  manager: {
    type: WebVcpManager,
    default: () => new WebVcpManager(),
  },
});

const manager = props.manager
const tickFrames = manager.data.tickFrames
const playState = manager.data.playState

const VideoClipCanvasRef = ref<HTMLDivElement>()
const TransformerRef = ref<typeof KTransformer>();

const stageSize = reactive({
  width: 0,
  height: 0
})
const selectedShapeId = ref("")

function handleStageMouseDown(e: KonvaEventObject<Stage, MouseEvent>) {
  if (playState.value !== "paused") return
  // 点击到场景，取消 Transformer
  if (e.target === e.target.getStage()) {
    selectedShapeId.value = ""
    updateTransformer();
    return;
  }

  // 点击到 Transformer
  const clickedOnTransformer =
    e.target.getParent()?.className === 'Transformer';
  if (clickedOnTransformer) {
    return;
  }

  // 点击到元素
  const id = e.target.id();
  const data = tickFrames.value.find((data) => data.id === id);
  if (data) {
    selectedShapeId.value = id;
  } else {
    selectedShapeId.value = '';
  }
  updateTransformer();
};

function updateTransformer() {
  if (!TransformerRef.value) return
  const transformerNode = TransformerRef.value.getNode();
  const stage = transformerNode.getStage();
  const selected = selectedShapeId.value;

  // 找到选中的元素
  const selectedNode = stage.findOne('#' + selected);
  // 选中元素与当前元素相同，保持原状
  if (selectedNode === transformerNode.nodes()[0]) return;

  // 不同时，更新 Transformer
  if (selectedNode) transformerNode.nodes([selectedNode]);
  else transformerNode.nodes([]);
};

function handleTransformEnd(e: KonvaEventObject<Node, MouseEvent>) {
  manager.data.setTransformById(selectedShapeId.value, {
    x: e.target.x(),
    y: e.target.y(),
    width: e.target.width(),
    height: e.target.height(),
    scaleX: e.target.scaleX(),
    scaleY: e.target.scaleY(),
    rotation: e.target.rotation(),
  })
}

function updateStageSize() {
  if (VideoClipCanvasRef.value) {
    const { clientWidth, clientHeight } = VideoClipCanvasRef.value
    stageSize.width = clientWidth
    stageSize.height = clientHeight
  }
}

onMounted(() => {
  updateStageSize()
})

</script>

<style scoped lang="scss">
.video-clip-canvas {
  min-height: 100px;
  overflow: hidden;
}
</style>