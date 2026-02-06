<!--
 * @Date: 2026-01-22 09:12:03
 * @LastEditTime: 2026-02-06 15:48:27
 * @Description: ar-plan-marker 测试点击放置
-->
<template>
    <view class="arplanemarker">
        <view class="middle">
            <block>
                <xr-ar-marker
                    ref="xrframeRef"
                    disable-scroll
                    id="main-frame"
                    :width="renderWidth"
                    :height="renderHeight"
                    :style="{ width: `${width}px`, height: `${height}px` }"
                    :resource="list"
                    @loadedChange="onLoadedChange"
                    @shareCapture="onShareCapture"
                />
            </block>
        </view>
        <view class="bottom">
            <view class="btn" @click="switchFn">切换</view>
            <view class="btn" @click="triggerShare">拍摄</view>
            <view class="btn" @click="removeModel">删除</view>
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

// 将base64转换为临时文件
const base64ToTempFile = (base64Data) => {
    return new Promise((resolve, reject) => {
        // 移除base64前缀
        const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, "");

        // 解码base64数据
        const buffer = uni.base64ToArrayBuffer(base64WithoutPrefix);
        // 生成目标文件路径
        const filePath = `${uni.env.USER_DATA_PATH}/temp_image_${Date.now()}.png`;

        // 创建临时文件
        uni.getFileSystemManager().writeFile({
            filePath: filePath,
            data: buffer,
            encoding: "binary",
            success: (res) => {
                resolve(filePath);
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};

// 保存图片到相册
const saveImageToPhotosAlbum = (filePath) => {
    uni.saveImageToPhotosAlbum({
        filePath: filePath,
        success: (res) => {
            console.log("图片保存成功:", res);
            uni.showToast({
                title: "保存成功",
                icon: "success",
            });
        },
        fail: (err) => {
            console.error("图片保存失败:", err, filePath);
            // 检查权限
            uni.getSetting({
                success: (settingRes) => {
                    if (!settingRes.authSetting["scope.writePhotosAlbum"]) {
                        uni.authorize({
                            scope: "scope.writePhotosAlbum",
                            success: () => {
                                console.log("获取相册权限成功");
                            },
                            fail: () => {
                                console.log("获取相册权限失败");
                                uni.showModal({
                                    title: "提示",
                                    content: "需要相册权限才能保存图片，请在设置中开启",
                                    showCancel: false,
                                });
                            },
                        });
                    }
                },
            });
        },
    });
};

/**
 * @name 分享功能回调
 */
const onShareCapture = (e) => {
    console.log("分享捕获", e.detail.filePath);
    // 转换base64为临时文件再保存
    base64ToTempFile(e.detail.filePath)
        .then((tempFilePath) => {
            saveImageToPhotosAlbum(tempFilePath);
        })
        .catch((err) => {
            console.error("转换base64图片失败:", err);
            uni.showToast({
                title: "图片处理失败",
                icon: "none",
            });
        });
};

/**
 * 触发分享功能
 * 异步执行，在下一个tick后调用xrframe实例的分享处理方法，
 * 并在500毫秒后显示预览界面
 */
const triggerShare = async () => {
    await nextTick();
    console.log("组件", xrframeRef.value);

    xrframeRef.value?.handleShare();
};

const switchFn = () => {
    list.value = [
        {
            id: "arrow03",
            type: "gltf",
            src: "http://192.168.0.115:30900/models/arrow03.gltf",
            scale: [0.05, 0.05, 0.05].join(" "),
            rotation: [0, 0, 0].join(" "),
            position: [0, -1, 2].join(" "),
            cameraPosition: [0, 0, 0].join(" "),
            cameraRotation: [0, 0, 0].join(" "),
            cameraFar: "1000",
            isTarget: true,
        },
    ];
};

const removeModel = () => {
    xrframeRef.value?.manualDestroyScene();
};

onMounted(() => {
    setTimeout(() => {
        list.value = [
            {
                id: "icy_dragon",
                type: "gltf",
                // src: "http://192.168.0.115:30900/models/icy_dragon.glb",
                src: "http://192.168.0.115:30900/models/arrow03.gltf",
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

onUnload(() => {
    // 页面卸载时，手动销毁xrframe实例，释放资源
    xrframeRef.value?.manualDestroyScene();
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
