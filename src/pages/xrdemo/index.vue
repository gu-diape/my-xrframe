<!--
 * @Date: 2026-01-08 09:34:55
 * @LastEditTime: 2026-01-08 16:55:20
 * @Description: xr demo page
-->
<template>
    <view class="xrdemo">
        <xr-start
            disable-scroll
            id="main-frame"
            :width="renderWidth"
            :height="renderHeight"
            :style="{ width: `${width}px`, height: `${height}px` }"
            @assetsLoaded="handleLoaded"
            @syncPositions="handleSyncPositions"
        />

        <view v-if="loaded">
            <view v-for="(pos, index) in positions" :key="index">
                <view
                    :style="{
                        display: 'block',
                        position: 'absolute',
                        left: `${pos[0]}px`,
                        top: `${pos[1]}px`,
                        background: `${pos[2]}`,
                        transform: 'translate(-50%, -50%)',
                    }"
                >
                    <view style="text-align: center; color: white; font-size: 24px; padding: 8px">{{ pos[3] }}</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
const width = ref(300);
const height = ref(300);
const renderWidth = ref(300);
const renderHeight = ref(300);
const loaded = ref(false);
const positions = ref([
    [0, 0, "rgba(44, 44, 44, 0.5)", ""],
    [0, 0, "rgba(44, 44, 44, 0.5)", ""],
]);

const handleLoaded = ({ detail }) => {
    loaded.value = true;
};

const handleSyncPositions = ({ detail }) => {
    positions.value = detail;
};

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
.xrdemo {
    display: flex;
    flex-direction: column;
}
</style>
