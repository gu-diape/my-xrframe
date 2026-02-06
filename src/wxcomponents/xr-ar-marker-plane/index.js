/*
 * @Date: 2026-01-22 09:15:21
 * @LastEditTime: 2026-02-06 17:10:46
 * @Description: file content
 */
Component({
    properties: {
        // 资源列表
        // [
        //     {
        //         id,
        //         type: gltf / texture (模型 / 纹理),
        //         src,
        //         scale?: 缩放 '1 1 1',
        //         rotation?: 旋转角度 '0 0 0',
        //         position?: 位置 '0 0 0',
        //         cameraPosition?: 相机位置 0 0 0,
        //         cameraRotation?: 相机旋转角度 '0 0 0',
        //         cameraFar?: 相机渲染最远距离(米) '10',
        //         isTarget?: 是否设置为相机焦点 false
        //     }
        // ]
        resource: {
            type: Array,
            default: () => [],
        },
    },
    data: {
        loaded: false,
        ready: false,
        modelId: [],
        list: [],
    },
    observers: {
        resource(newVal) {
            if (newVal.length > 0) {
                this.setData(
                    {
                        list: newVal,
                    },
                    () => {
                        this.loader();
                    },
                );
            }
        },
    },
    methods: {
        handleReady({ detail }) {
            this.scene = detail.value;
            console.log("xr-scene", this.scene);
            this.shadowNode = this.scene.getElementById("shadow-node");
            this.setData({ ready: true });
        },

        handleAssetsProgress(value) {
            console.log("assets progress", value);
            this.triggerEvent("loadProgress", value);
        },

        handleAssetsLoaded(value) {
            console.log("assets loaded", value);
            this.setData({ loaded: value });
            this.triggerEvent("loadedChange", { loaded: value });
            this.scene.event.addOnce("touchstart", this.placeNode.bind(this));
        },

        /**
         * 加载资源
         * @param item 资源参数
         */
        loadAssets(item) {
            const scene = this.scene;
            scene.assets.loadAsset({
                type: item.type,
                assetId: item.id,
                src: item.src,
                options: {},
            });
        },

        async loader() {
            const scene = this.scene;
            const shadowNode = this.shadowNode;
            const xrFrameSystem = wx.getXrFrameSystem();
            // 动态创建添加资源加载器，加载资源和监听加载进度和状态
            const assetsNode = scene.createElement(xrFrameSystem.XRAssets);
            shadowNode.addChild(assetsNode);
            assetsNode.event.add("progress", (event) => {
                console.log(">>> progress", event);
                this.handleAssetsProgress(event.progress);
            });
            assetsNode.event.add("loaded", (event) => {
                console.log(">>> loaded", event);
                this.handleAssetsLoaded(true);
            });

            //纹理贴图、模型、追踪器分别加载
            const textures = this.data.list.filter((i) => i.type === "texture");
            const gltfs = this.data.list.filter((i) => i.type === "gltf");

            // 动态创建添加纹理资源
            textures.forEach((i) => {
                this.loadAssets(i);
            });

            // 动态创建资源加载器添加GLTF资源
            gltfs.forEach((i) => {
                const gltfNode = scene.createElement(xrFrameSystem.XRAssetLoad, {
                    type: i.type,
                    "asset-id": "gltf-" + i.id,
                    src: i.src,
                });
                assetsNode.addChild(gltfNode);
            });
            // 普通3D场景，直接渲染GLTF节点
            gltfs.forEach(async (i) => {
                if (i.isContainer) {
                    const arTracker = scene.createElement(xrFrameSystem.XRARTracker, { mode: "Plane" });
                    const gltfNode = scene.createElement(xrFrameSystem.XRGLTF, {
                        model: "gltf-" + i.id,
                    });
                    arTracker.addChild(gltfNode);
                    shadowNode.addChild(arTracker);
                    return;
                }
                const containerNode = scene.createElement(xrFrameSystem.XRNode, {
                    "node-id": "setitem",
                    visible: "false",
                });
                const gltfNode = scene.createElement(xrFrameSystem.XRGLTF, {
                    "node-id": "mesh-gltf-" + i.id,
                    model: "gltf-" + i.id,
                    "anim-autoplay": "",
                    position: i.position || "",
                    scale: i.scale || "",
                    rotation: i.rotation || "",
                });
                containerNode.addChild(gltfNode);
                shadowNode.addChild(containerNode);

                // if (i.isTarget) {
                //     const cameraElement = scene.getComponent(xrFrameSystem.XRCamera);
                //     console.log("相机组件", cameraElement);
                //     if (!cameraElement) {
                //         // 动态创建添加相机、相机控制器，修改相机target
                //         const cameraElement = scene.createElement(xrFrameSystem.XRCamera, {
                //             position: i.cameraPosition || "",
                //             rotation: i.cameraRotation || "",
                //             far: i.cameraFar || "1000",
                //             background: "ar",
                //         });
                //         shadowNode.addChild(cameraElement);
                //     } else {
                //         cameraElement.setData({
                //             position: i.cameraPosition || "",
                //             rotation: i.cameraRotation || "",
                //             far: i.cameraFar || "1000",
                //         });
                //         shadowNode.addChild(cameraElement);
                //     }
                // }
            });
        },

        placeNode(event) {
            const { clientX, clientY } = event.touches[0];
            const { frameWidth: width, frameHeight: height } = this.scene;

            if (clientY / height > 0.8 && clientX / width < 0.2) {
                this.scene.getNodeById("setitem").visible = false;
                this.scene.ar.resetPlane();
            } else {
                this.scene.ar.placeHere("setitem", true);
            }

            this.scene.event.addOnce("touchstart", this.placeNode.bind(this));
        },
    },
});
