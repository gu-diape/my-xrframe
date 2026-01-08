Component({
    properties: {},
    data: {
        avatarTextureId: "white",
    },
    methods: {
        /**
         * 在ready事件中通过id索引获取了需要的实例并存了下来，
         * 然后在每帧的tick事件中实时获取物体的世界坐标，
         * 将其转换为屏幕的位置，并且还加上了在用户点击时改变颜色color的效果。
         * 在最后，我们通过this.triggerEvent，从组件向页面发起了通信，
         * 一个是资源加载完成的事件assetsLoaded，一个是坐标更新的事件syncPositions。
         */
        handleReady: function ({ detail }) {
            console.log("scene ready", detail);
            this.scene = detail.value;
            wx.getUserInfo({
                desc: "获取头像",
                success: (res) => {
                    console.log("get user info", res);
                    this.scene.assets
                        .loadAsset({
                            type: "texture",
                            assetId: "avatar",
                            src: res.userInfo.avatarUrl,
                        })
                        .then(() => this.setData({ avatarTextureId: "avatar" }));
                },
            });

            const xrFrameSystem = wx.getXrFrameSystem();
            this.camera = this.scene.getElementById("camera").getComponent(xrFrameSystem.Camera);
            this.helmet = { el: this.scene.getElementById("helmet"), color: "rgba(44, 44, 44, 0.5)" };
            this.miku = { el: this.scene.getElementById("miku"), color: "rgba(44, 44, 44, 0.5)" };
            this.tmpV3 = new xrFrameSystem.Vector3();
        },

        handleAssetsProgress: function ({ detail }) {
            console.log("assets progress", detail.value);
        },
        handleAssetsLoaded: function ({ detail }) {
            console.log("assets loaded", detail.value);
            this.triggerEvent("assetsLoaded", detail.value);
        },
        handleTick: function ({ detail }) {
            this.helmet &&
                this.triggerEvent("syncPositions", [
                    this.getScreenPosition(this.helmet),
                    this.getScreenPosition(this.miku),
                ]);
        },
        handleTouchModel: function ({ detail }) {
            const { target } = detail.value;
            const id = target.id;

            wx.showToast({ title: `点击了模型： ${id}` });

            this[id].color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        },
        getScreenPosition: function (value) {
            const { el, color } = value;
            const xrFrameSystem = wx.getXrFrameSystem();
            this.tmpV3.set(el.getComponent(xrFrameSystem.Transform).worldPosition);
            const clipPos = this.camera.convertWorldPositionToClip(this.tmpV3);
            const { frameWidth, frameHeight } = this.scene;
            return [((clipPos.x + 1) / 2) * frameWidth, (1 - (clipPos.y + 1) / 2) * frameHeight, color, el.id];
        },
    },
});
