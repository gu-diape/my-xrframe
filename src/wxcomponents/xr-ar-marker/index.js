/*
 * @Date: 2026-01-22 09:15:21
 * @LastEditTime: 2026-01-22 19:13:31
 * @Description: file content
 */
Component({
    properties: {
        modelUrlRaw: {
            type: String,
            default: "",
        },
    },
    data: {
        loaded: false,
        arReady: false,
        gltfLoaded: false,
        modelId: "gltf-" + new Date().getTime(),
    },
    observers: {
        modelUrlRaw(newVal) {
            this.setData({
                modelUrl: newVal,
            });
        },
    },
    methods: {
        handleReady({ detail }) {
            this.scene = detail.value;
            console.log("xr-scene", this.scene);
            this.loadGLTF();
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
        handleARReady: function () {
            console.log("arReady");
            this.setData({ arReady: true });
        },
        async loadGLTF() {
            const scene = this.scene;
            try {
                const res = await scene.assets.loadAsset({
                    type: "gltf",
                    assetId: this.data.modelId,
                    src: this.data.modelUrl,
                });
                console.log("glTF asset loaded", res);
                this.setData({ gltfLoaded: true });
            } catch (error) {
                console.error("load glTF asset error", error);
            }
        },
        // 分享回调
        handleShare: function () {
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
