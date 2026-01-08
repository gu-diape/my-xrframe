<!--
 * @Date: 2026-01-08 17:37:01
 * @LastEditTime: 2026-01-08 17:40:41
 * @Description: ar-demo
-->
<template>
    <view class="ardemo">
        <xr-ar
            disable-scroll
            id="main-frame"
            :width="renderWidth"
            :height="renderHeight"
            :style="{ width: `${width}px`, height: `${height}px` }"
        />
    </view>
</template>

<script setup name="ARDEMO">
const width = ref(300);
const height = ref(300);
const renderWidth = ref(300);
const renderHeight = ref(300);

onLoad(() => {
    // 获取屏幕宽高
    const windowInfo = uni.getWindowInfo();
    width.value = windowInfo.windowWidth;
    height.value = windowInfo.windowHeight;
    renderWidth.value = width.value * windowInfo.pixelRatio;
    renderHeight.value = height.value * windowInfo.pixelRatio;
});
</script>

<style lang="scss" scoped>
.ardemo {
    display: flex;
    flex-direction: column;
}
</style>
