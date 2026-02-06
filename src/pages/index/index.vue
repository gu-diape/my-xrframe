<!--
 * @Date: 2026-01-08 17:24:42
 * @LastEditTime: 2026-02-06 16:27:16
 * @Description: app
-->
<template>
    <view class="index">
        <button @click="handleNavTo('xrdemo')">xr-demo</button>
        <button @click="handleNavTo('ardemo')">ar-demo</button>
        <button @click="handleNavTo('xrdemo_ai')">ar-demo-ai</button>
        <button @click="handleNavTo('armarker')">ar-marker</button>
        <button @click="handleNavTo('arplanemarker')">ar-marker-plane</button>
    </view>
</template>

<script setup>
const handleNavTo = (path) => {
    uni.navigateTo({
        url: `/pages/${path}/index`,
    });
};
</script>

<style lang="scss" scoped></style>
