<template>
  <div class="toolbar-layout">
    <div class="toolbar-layout__left"><slot name="left"></slot></div>
    <div class="toolbar-layout__center"><slot name="center"></slot></div>
    <div class="toolbar-layout__right"><slot name="right"></slot></div>
  </div>
</template>

<style scoped lang="scss">
.toolbar-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100vw;
  overflow: hidden;
}

.toolbar-layout__left,
.toolbar-layout__center,
.toolbar-layout__right {
  display: flex;
  align-items: center;
}

.toolbar-layout__left,
.toolbar-layout__right {
  flex: 1;
}

.toolbar-layout__center {
  justify-content: center;
}

.toolbar-layout__right {
  justify-content: flex-end;
}
</style>
