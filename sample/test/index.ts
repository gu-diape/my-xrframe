/*
 * @Date: 2026-01-27 14:30:49
 * @LastEditTime: 2026-01-27 14:31:10
 * @Description: file content
 */
import { SystemType, AssetType, AssetItem, XrLoader } from "../xr-loader";

const mockData: AssetItem[] = [
    {
        id: "Scene_Background",
        type: AssetType.GLTF,
        src: "/assets/model/Scene_Background.glb",
        scale: [1, 1, 1].join(" "),
        rotation: [0, 0, 0].join(" "),
        position: [0, 0, 0].join(" "),
        cameraPosition: [0, 0.7, 7.5].join(" "),
        cameraRotation: [-11, 0, 0].join(" "),
        cameraFar: "1000",
        isTarget: true,
    },
    {
        id: "Floor_Niba",
        type: AssetType.GLTF,
        src: "/assets/model/Floor_Niba.glb",
        scale: [1, 1, 1].join(" "),
        rotation: [0, 0, 0].join(" "),
        position: [0, 0, 0].join(" "),
    },
    {
        id: "niu_00",
        type: AssetType.GLTF,
        src: "/assets/model/niu_ceshi.glb",
        scale: "1 1 1",
        rotation: "0 0 0",
        position: "4 0 0",
        hasEvent: true,
    },
    {
        id: "niu_00-default",
        type: AssetType.TEXTURE,
        src: "/assets/texture/Niu01_Flat.png",
    },
    {
        id: "niu_00-active",
        type: AssetType.TEXTURE,
        src: "/assets/texture/Niu01_Jirou_Cartoon_Flat.png",
    },
];
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        loaded: false,
    },
    lifetimes: {},
    /**
     * 组件的方法列表
     */
    methods: {
        handleReady: function ({ detail }) {
            const that = this;
            const xrLoader = new XrLoader({
                type: SystemType.NORMAL,
                scene: detail.value,
                list: mockData,
                shadowId: "shadow-node",
                progress(value: number) {
                    // console.log('>>> progress', value)
                    that.triggerEvent("loadProgress", value * 100);
                },
                loaded(value: boolean) {
                    // console.log('>>> loaded', value)
                },
            });
            console.log(">>> xrLoader", xrLoader);
        },
    },
});
