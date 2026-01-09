Component({
    properties: {},
    data: {},
    methods: {
        handleReady: function ({ detail }) {
            console.log("scene ready", detail);
            this.scene = detail.value;
        },
        handleAssetsLoaded: function ({ detail }) {
            // wx.showToast({ title: "点击屏幕放置" });
            // this.scene.event.add("touchstart", () => {
            //     this.scene.ar.placeHere("setitem", true);
            // });

            // this.setData({ loaded: true });
            // const el = this.scene.getElementById("tracker");
            // this.tracker = el.getComponent(wx.getXrFrameSystem().ARTracker);
            // this.gesture = -1;

            this.setData({ loaded: true });
        },
        handleTick: function () {
            if (!this.tracker) return;
            // gesture 手势编号 score 置信度
            const { gesture, score } = this.tracker;
            if (score < 0.5 || gesture === this.gesture) {
                return;
            }

            console.log("手势编号", gesture);

            this.gesture = gesture;
            gesture === 6 && wx.showToast({ title: "好！" });
            gesture === 14 && wx.showToast({ title: "唉..." });
        },

        handleTrackerSwitch: function ({ detail }) {
            const active = detail.value;
            const video = this.scene.assets.getAsset("video-texture", "hikari");
            active ? video.play() : video.stop();
        },

        // 分享回调
        handleShare: function () {
            // this.scene.share.captureToFriends(); // 分享给朋友
            this.scene.share.captureToLocalPath({ fileType: "png", quality: 1 }, (fq) => {
                console.log("capture to local path", fq);
            }); // 分享网址
        },
    },
});
