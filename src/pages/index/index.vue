<!--
 * @Date: 2026-01-08 17:24:42
 * @LastEditTime: 2026-01-13 10:06:03
 * @Description: app
-->
<template>
    <view class="index">
        <button @click="handleNavTo('xrdemo')">xr-demo</button>
        <button @click="handleNavTo('ardemo')">ar-demo</button>
        <button @click="handleNavTo('xrdemo_ai')">ar-demo-ai</button>
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
