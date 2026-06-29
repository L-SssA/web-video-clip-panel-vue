<template>
  <i class="icon-btn" :class="[iconClass, { 'icon-btn-disabled': disabled }]" @click="!disabled && emits('click')">
    <ElPopover placement="bottom" trigger="hover" :content="tipsText" :disabled="!tipsText" :effect="effect"
      width="fit-content" :popper-style="{ minWidth: '0' }">
      <template #reference>
        <div class="tips-box"></div>
      </template>
    </ElPopover>
  </i>
</template>

<script setup lang="ts">
const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tipsText: {
    type: String,
    default: "",
  },
  effect: {
    type: String,
    default: "dark",
  },
});
const emits = defineEmits(["click"]);
</script>

<style scoped lang="scss">
.icon-btn {
  cursor: pointer;
  margin: 0 10px;
  font-size: 20px;
  position: relative;

  &.icon-btn-disabled {
    cursor: not-allowed;
    color: var(--vcp-color-light);
  }

  &:not(.icon-btn-disabled):hover {
    opacity: 0.8;
  }

  &:not(.icon-btn-disabled):active {
    opacity: 0.6;
  }

  .tips-box {
    position: absolute;
    inset: 0;
  }
}
</style>
