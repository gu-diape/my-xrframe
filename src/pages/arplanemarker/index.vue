<!--
 * @Date: 2026-01-22 09:12:03
 * @LastEditTime: 2026-02-06 17:03:18
 * @Description: ar-plan-marker 测试点击放置
-->
<template>
    <view class="arplanemarker">
        <view class="middle">
            <block>
                <xr-ar-marker-plane
                    ref="xrframeRef"
                    disable-scroll
                    id="main-frame"
                    :width="renderWidth"
                    :height="renderHeight"
                    :style="{ width: `${width}px`, height: `${height}px` }"
                    :resource="list"
                    @loadedChange="onLoadedChange"
                />
            </block>
        </view>
    </view>
</template>

<script setup name="ARMARKER">
const width = ref(300);
const height = ref(600);
const renderWidth = ref(300);
const renderHeight = ref(300);
const xrframeRef = ref(null);
const list = ref([]);

/**
 * @name 模型加载回调
 */
const onLoadedChange = (e) => {
    if (e.detail.loaded) {
        uni.showToast("模型加载完成");
    } else {
        uni.showToast("模型加载中...");
    }
};

onMounted(() => {
    setTimeout(() => {
        list.value = [
            {
                id: "anchor",
                type: "gltf",
                src: "https://mmbizwxaminiprogram-1258344707.cos.ap-guangzhou.myqcloud.com/xr-frame/demo/ar-plane-marker.glb",
                isContainer: true,
            },
            {
                id: "icy_dragon",
                type: "gltf",
                // src: "http://192.168.0.109:30900/models/icy_dragon.glb",
                src: "http://192.168.0.109:30900/models/arrow03.gltf",
                scale: [0.03, 0.03, 0.03].join(" "),
                rotation: [0, 0, 0].join(" "),
                position: [0, 0, 0].join(" "),
                cameraPosition: [0, -4, 2].join(" "),
                cameraRotation: [0, 0, 0].join(" "),
                cameraFar: "1000",
                isTarget: true,
            },
        ];
    }, 1000);
});

onLoad(() => {
    // 获取屏幕宽高
    const windowInfo = uni.getWindowInfo();
    width.value = windowInfo.windowWidth;
    renderWidth.value = width.value * windowInfo.pixelRatio;
    renderHeight.value = height.value * windowInfo.pixelRatio;
});
</script>

<style lang="scss" scoped>
.arplanemarker {
    display: flex;
    justify-content: center;
    flex-direction: column;

    .middle {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
    }

    .bottom {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 25px;
        padding: 20px 10px;

        .btn {
            background-color: #0082ff;
            color: #000;
            padding: 10px 15px;
            border-radius: 5px;
        }
    }
}
</style>
