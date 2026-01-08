Component({
    properties: {},
    data: {},
    methods: {
        handleReady: function ({ detail }) {
            console.log("scene ready", detail);
            this.scene = detail.value;
        },
        handleAssetsLoaded: function ({ detail }) {
            wx.showToast({ title: "点击屏幕放置" });
            this.scene.event.add("touchstart", () => {
                this.scene.ar.placeHere("setitem", true);
            });
        },
    },
});
