<template>
  <i class="icon-btn" :class="[iconClass, { 'icon-btn-disabled': disabled, 'actived': active }]"
    @click="!disabled && emits('click')">
    <ElPopover placement="bottom" trigger="hover" :content="tipsText" :disabled="!tipsText" :effect="effect"
      width="fit-content" :popper-style="{ minWidth: '0', ...themeStyle }">
      <template #reference>
        <div class="tips-box"></div>
      </template>
    </ElPopover>
  </i>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { themeStyles } from "@/config/iconButtonStyles";
import { ElPopover } from "element-plus";

const props = defineProps({
  iconClass: {
    type: String,
    default: "",
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
  active: {
    type: Boolean,
    default: false,
  }
});
const emits = defineEmits(["click"]);

const themeStyle = computed(() => themeStyles[props.effect] || "");
</script>

<style scoped lang="scss">
.icon-btn {
  cursor: pointer;
  font-size: 20px;
  position: relative;

  &.actived {
    color: var(--vcp-color-active);
  }

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
