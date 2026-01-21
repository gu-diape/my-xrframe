/*
 * @Date: 2026-01-13 10:05:20
 * @LastEditTime: 2026-01-16 10:24:55
 * @Description: file content
 */
Component({
    properties: {},
    data: {
        loaded: false,
    },
    lifetimes: {
        attached() {
            console.log("data.a", this.data.a); // expected 123
        },
    },
    methods: {
        handleReady({ detail }) {
            const xrScene = (this.scene = detail.value);
            console.log("xr-scene", xrScene);
        },
        handleAssetsProgress: function ({ detail }) {
            console.log("assets progress", detail.value);
            this.triggerEvent("loaded-change", { loaded: false });
        },
        handleAssetsLoaded: function ({ detail }) {
            console.log("assets loaded", detail.value);
            this.setData({ loaded: true });
            this.triggerEvent("loaded-change", { loaded: true });
        },
        handleARReady: function ({ detail }) {
            console.log("ar-ready", this.scene.ar.arModes, this.scene.ar.arVersion);
        },
        handleARError: function ({ detail }) {
            console.log("ar-error", detail);
        },

        // 重置模型到初始状态
        resetModel: function () {
            if (this.scene) {
                // 获取模型节点并重置其位置、旋转和缩放
                const modelNode = this.scene.getNodeById("mesh-gltf-table");
                if (modelNode) {
                    // 重置模型的位置、旋转和缩放到初始状态
                    modelNode.setData({
                        position: [0, -1, 0],
                        rotation: [0, 45, 0],
                        scale: [0.08, 0.08, 0.08],
                    });
                }
            }
        },

        // 分享回调
        handleShare: function () {
            // this.scene.share.captureToFriends(); // 分享给朋友
            // 截屏输出为本地路径，回调完成后会自动释放
            this.scene.share
                .captureToDataURLAsync({ fileType: "png", quality: 1 })
                .then((res) => {
                    this.triggerEvent("share-capture", { filePath: res });
                })
                .catch((err) => {
                    console.error("capture to local path error", err);
                });
        },
    },
});
