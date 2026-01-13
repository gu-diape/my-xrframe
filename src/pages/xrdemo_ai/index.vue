<!--
 * @Date: 2026-01-13 10:04:36
 * @LastEditTime: 2026-01-13 20:09:57
 * @Description: file content
-->
<template>
    <view class="xrdemo_ai">
        <view class="top mask" :style="{ height: `${statusBarHeight}px` }">
            <text>大蜥蜴</text>
        </view>
        <view class="middle">
            <xr-ar-ai
                v-if="!showPreview"
                ref="xrframeRef"
                disable-scroll
                id="main-frame"
                :width="renderWidth"
                :height="renderHeight"
                :style="{ width: `${width}px`, height: `${height}px`, display: 'block' }"
                :orientation="orientation"
                @loaded-change="onLoadedChange"
                @share-capture="onShareCapture"
            />
            <image v-else :src="capturedImage" mode="aspectFit" />
        </view>
        <view class="bottom mask">
            <view class="tips">Tips：拖动模型可移动位置</view>
            <view class="btn-identify">
                <template v-if="!showPreview">
                    <view class="back" @click="resetModel">
                        <image src="/static/logo.png" />
                        <text>重置模型</text>
                    </view>
                    <view class="btn" @click="triggerShare">
                        <image src="/static/logo.png" />
                        <text>拍摄</text>
                    </view>
                </template>
                <template v-else>
                    <view class="back" @click="resetCapture">
                        <image src="/static/logo.png" />
                        <text>重新拍摄</text>
                    </view>
                    <view class="btn" @click="onSaveCapture">
                        <image src="/static/logo.png" />
                        <text>保存</text>
                    </view>
                </template>
                <view class="switch" @click="switchCamera">
                    <image src="/static/logo.png" />
                    <text>切换摄像头</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup name="XRDEMOAI">
const width = ref(300);
const height = ref(500);
const statusBarHeight = ref(300);
const renderWidth = ref(300);
const renderHeight = ref(300);
const showPreview = ref(false);
const xrframeRef = ref(null);
const capturedImage = ref("");
const orientation = ref("modes:Plane; camera:Back");
const onLoadedChange = (e) => {
    let load = e.detail.loaded;
    if (!load) {
        uni.showLoading({ title: "模型加载中...", mask: true });
    } else {
        uni.hideLoading();
    }
};

/**
 * @name 分享功能回调
 */
const onShareCapture = (e) => {
    // console.log("分享捕获", e.detail.filePath);
    capturedImage.value = e.detail.filePath;
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
 * 触发分享功能
 * 异步执行，在下一个tick后调用xrframe实例的分享处理方法，
 * 并在500毫秒后显示预览界面
 */
const triggerShare = async () => {
    await nextTick();
    console.log("组件", xrframeRef.value);

    xrframeRef.value?.handleShare();
    setTimeout(() => {
        showPreview.value = true;
    }, 200);
};

/**
 * 重置拍照功能的状态
 * 清空已捕获的图片数据并隐藏预览界面
 */
const resetCapture = () => {
    capturedImage.value = "";
    showPreview.value = false;
};

/**
 * @name 保存图片
 */
const onSaveCapture = () => {
    // 转换base64为临时文件再保存
    base64ToTempFile(capturedImage.value)
        .then((tempFilePath) => {
            console.log("发的口水歌", tempFilePath);

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

// 重置模型到初始状态
const resetModel = () => {
    if (xrframeRef.value) {
        // 调用xr-ar-ai组件的resetModel方法
        xrframeRef.value.resetModel();
    } else {
        console.warn("xrframeRef未定义，无法重置模型");
    }
};

// 切换摄像头
const switchCamera = () => {
    // 实现不出来
    // showPreview.value = true;
    // orientation.value =
    //     orientation.value === "modes:Plane; camera:Back" ? "modes:Plane; camera:Front" : "modes:Plane; camera:Back";
    // setTimeout(() => {
    //     showPreview.value = false;
    // }, 200);
};

onLoad(() => {
    // 获取屏幕宽高
    const windowInfo = uni.getWindowInfo();
    console.log("环境信息", windowInfo);
    statusBarHeight.value = windowInfo.statusBarHeight;
    width.value = windowInfo.windowWidth;
    // height.value = windowInfo.windowHeight;
    renderWidth.value = width.value * windowInfo.pixelRatio;
    renderHeight.value = height.value * windowInfo.pixelRatio;
});
</script>

<style lang="scss" scoped>
.xrdemo_ai {
    height: 100%;
    min-height: 100%;
    color: #fff;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    > view {
        width: 100%;
    }

    .mask {
        background-color: rgba(0, 0, 0, 0.8);
    }

    > .middle {
        height: 1000rpx;
        display: flex;
        overflow: hidden;
        > image {
            width: 100%;
            height: 100%;
        }
    }

    > .top {
        position: relative;
        > text {
            position: absolute;
            bottom: 15rpx;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24rpx;
            font-weight: 500;
        }
    }

    > .bottom {
        flex: 1;
        padding: 20rpx 32rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        > .btn-identify {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 112rpx;
            margin-top: 38rpx;

            > view {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }

            > .back {
                opacity: 0.5;
                > image {
                    width: 96rpx;
                    height: 96rpx;
                    margin-bottom: 8rpx;
                }

                > text {
                    font-size: 24rpx;
                    font-weight: 500;
                }
            }

            > .btn {
                > image {
                    width: 152rpx;
                    height: 152rpx;
                    margin-bottom: 10rpx;
                }

                > text {
                    font-size: 32rpx;
                    font-weight: 600;
                }
            }

            > .switch {
                > image {
                    width: 96rpx;
                    height: 96rpx;
                    margin-bottom: 8rpx;
                }

                > text {
                    font-size: 24rpx;
                    font-weight: 500;
                }
            }
        }
    }
}
</style>
