/**
 * 3D场景渲染和加载
 */
import { Scene, Element, Mesh, XRGLTF, Texture, Transform, XRNode } from "XrFrame";
/**
 * 相机类型
 */
enum SystemType {
    /**
     * 普通相机
     *  @description 普通相机
     */
    NORMAL = "normal",
    /**
     * AR相机
     *  @description AR相机
     */
    AR = "ar",
}
/**
 * 资源类型
 */
enum AssetType {
    /**
     * GLTF模型
     */
    GLTF = "gltf",
    /**
     * 纹理贴图
     */
    TEXTURE = "texture",
    /**
     * 追踪器图片
     */
    TRACKER = "tracker",
}
/**
 * 鼠标状态
 */
enum STATE {
    /**
     * 默认
     */
    NONE = -1,
    /**
     * 移动/旋转
     */
    MOVE = 0,
    /**
     * 缩放
     */
    ZOOM_OR_PAN = 1,
}
/**
 * 资源参数
 */
interface AssetItem {
    [key: string]: any;
    /**
     * 资源id
     */
    id: string;
    /**
     * 资源类型
     */
    type: AssetType;
    /**
     * 资源地址
     */
    src: string;
    /**
     * 追踪器 关联资源id
     */
    trackerId?: string[];
    /**
     * 模型缩放
     */
    scale?: string;
    /**
     * 模型旋转
     */
    rotation?: string;
    /**
     * 模型位置
     */
    position?: string;
    /**
     * 相机位置
     */
    cameraPosition?: string;
    /**
     * 相机旋转
     */
    cameraRotation?: string;
    /**
     * 相机最远渲染距离
     */
    cameraFar?: string;
    /**
     * 是否需要绑定点击事件
     */
    hasEvent?: boolean;
    /**
     * 是否设置相机target
     */
    isTarget?: boolean;
}
/**
 * 鼠标参数
 */
interface MouseInfo {
    /**
     * 触摸按下的X位置
     */
    startX: number;
    /**
     * 触摸按下的Y位置
     */
    startY: number;
    /**
     * 是否触摸按下
     */
    isDown: boolean;
    /**
     * 距离触摸按下的位置偏移量
     */
    startPointerDistance: number;
    /**
     * 触摸状态
     */
    state: STATE;
}
/**
 * 加载中
 */
type Progress = (value: number) => void;
/**
 * 加载完成
 */
type Loaded = (value: boolean) => void;
/**
 * 实例化参数
 */
interface Options {
    /**
     * 相机类型
     */
    type: SystemType;
    /**
     * 场景实例
     */
    scene: Scene;
    /**
     * 资源列表
     */
    list: AssetItem[];
    /**
     * 自定义根节点id
     */
    shadowId: string;
    /**
     * 进度条回调
     */
    progress?: Progress;
    /**
     * 加载完成回调
     */
    loaded?: Loaded;
}
/**
 * @class XrLoader - XR-FRAME渲染和加载
 */
class XrLoader {
    /**
     * 相机类型
     */
    type: SystemType;
    /**
     * 场景实例
     */
    scene: Scene;
    /**
     * 资源列表
     */
    list: AssetItem[];
    /**
     * 自定义根节点
     */
    shadowNode: Element;
    /**
     * 选中的mesh
     */
    activeMesh: Mesh | null = null;
    /**
     * AR追踪器对应的模型根节点
     */
    gltfItemTRS: Transform[] = [];
    /**
     * AR追踪器对应的模型子节点
     */
    gltfItemSubTRS: Transform[] = [];
    /**
     * 鼠标参数
     */
    mouseInfo: MouseInfo = {
        startX: 0,
        startY: 0,
        isDown: false,
        startPointerDistance: 0,
        state: STATE.NONE,
    };
    /**
     * 旋转宽高比
     */
    radius: number = 0;
    /**
     * 旋转速度
     */
    rotateSpeed: number = 5;
    /**
     * 进度条回调
     */
    progress: Progress = () => {};
    /**
     * 加载完成回调
     */
    loaded: Loaded = () => {};
    /**
     * 构造函数初始化一个新的 XrLoader 实例。
     * @constructor
     * @param {Options} options - 包含场景初始化选项的对象。
     * @options type 相机类型
     * @options scene 场景实例
     * @options list 资源列表
     * @options shadowId 自定义根节点id
     * @options progress 进度条回调
     * @options loaded 加载完成回调
     */
    constructor(options: Options) {
        const { type, scene, list, shadowId, progress, loaded } = options;
        this.type = type;
        this.scene = scene;
        this.list = list;
        if (progress) {
            this.progress = progress;
        }
        if (loaded) {
            this.loaded = loaded;
        }
        this.shadowNode = scene.getElementById(shadowId);

        const { width, height } = scene;
        // 旋转缩放相关配置
        this.radius = (width + height) / 4;

        this.loader();
    }
    /**
     * 开始加载
     */
    async loader() {
        const scene = this.scene;
        const shadowNode = this.shadowNode;
        const list = this.list;
        const xrFrameSystem = wx.getXrFrameSystem();
        // 动态创建添加资源加载器，加载资源和监听加载进度和状态
        const assetsNode = scene.createElement(xrFrameSystem.XRAssets);
        shadowNode.addChild(assetsNode);
        assetsNode.event.add("progress", (event) => {
            if (this.progress) {
                this.progress(event.progress);
            }
        });
        assetsNode.event.add("loaded", (event) => {
            // console.log('>>> loaded', event)
            if (this.type === SystemType.AR) {
                // 需等GLTF加载完再添加追踪器，不然获取不到model
                this.addTrackers();
            }
            if (this.loaded) {
                this.loaded(true);
            }
        });
        //纹理贴图、模型、追踪器分别加载
        const textures = list.filter((i) => i.type === AssetType.TEXTURE);
        const gltfs = list.filter((i) => i.type === AssetType.GLTF);

        // 动态创建添加纹理资源
        textures.forEach((i) => {
            this.loadAssets(i);
        });

        // 动态创建添加GLTF资源
        gltfs.forEach((i) => {
            const gltfNode = scene.createElement(xrFrameSystem.XRAssetLoad, {
                type: i.type,
                "asset-id": "gltf-" + i.id,
                src: i.src,
            });
            assetsNode.addChild(gltfNode);
        });

        if (this.type === SystemType.NORMAL) {
            // 普通3D场景，直接渲染GLTF节点
            gltfs.forEach(async (i) => {
                const gltfNode = scene.createElement(xrFrameSystem.XRGLTF, {
                    "node-id": "mesh-gltf-" + i.id,
                    model: "gltf-" + i.id,
                    "anim-autoplay": "",
                    position: i.position || "",
                    scale: i.scale || "",
                    rotation: i.rotation || "",
                });
                // gltfNode.addComponent(xrFrameSystem.CubeShape, { autoFit: true })
                // gltfNode.addComponent(xrFrameSystem.ShapeGizmos)
                // gltfNode.event.add('touch-shape', (event: { target: Element }) => {
                //   console.log('>>> click event', event)
                // });
                gltfNode.event.add("gltf-loaded", (event: { target: XRGLTF }) => {
                    // console.log('>>> gltf-loaded', event)
                    if (i.hasEvent) {
                        this.addEvent(event.target, i.id);
                    }
                });
                shadowNode.addChild(gltfNode);

                if (i.isTarget) {
                    // 动态创建添加相机、相机控制器，修改相机target
                    const cameraElement = scene.createElement(xrFrameSystem.XRCamera, {
                        position: i.cameraPosition || "",
                        rotation: i.cameraRotation || "",
                        target: "mesh-gltf-" + i.id,
                        far: i.cameraFar || "1000",
                        background: "skybox",
                    });
                    shadowNode.addChild(cameraElement);
                    cameraElement.addComponent(xrFrameSystem.CameraOrbitControl);
                    cameraElement.getComponent(xrFrameSystem.CameraOrbitControl).setData({
                        isLockZoom: true,
                        isLockY: true,
                    });
                }
            });
        }
        // else if (this.type === SystemType.AR) {
        // }
    }
    /**
     * 动态创建添加追踪器
     */
    addTrackers() {
        const scene = this.scene;
        const shadowNode = this.shadowNode;
        const list = this.list;
        const xrFrameSystem = wx.getXrFrameSystem();

        const gltfs = list.filter((i) => i.type === AssetType.GLTF);
        const trackers = list.filter((i) => i.type === AssetType.TRACKER);
        // AR模式，GLTF节点需要先离屏1000，然后通过追踪器渲染
        // 节点结构：TRS node > SubTRS node > GLTF node
        // 加载追踪器资源
        this.gltfItemTRS = [];
        this.gltfItemSubTRS = [];
        trackers.forEach(async (i) => {
            // 动态创建添加追踪器
            const lockTrackerEl = scene.createElement(xrFrameSystem.XRNode);
            lockTrackerEl.addComponent(xrFrameSystem.ARTracker, {
                mode: "Marker",
                src: i.src,
            });
            shadowNode.addChild(lockTrackerEl);

            // 追踪器和模型关系 一对多
            const lockItemEles: Element[] = [];
            // 创建 TRS对应节点
            const lockParentEl = scene.createElement(xrFrameSystem.XRNode);
            i.trackerId?.forEach((id) => {
                // 找到对应的模型配置参数
                const gltfParams = gltfs.find((p) => p.id === id);
                if (gltfParams) {
                    // 创建 SubTRS对应节点
                    // 初始化 渲染到屏幕外 x:10000
                    const lockItemEle = scene.createElement(xrFrameSystem.XRNode, {
                        position: "10000 0 0",
                    });
                    lockParentEl.addChild(lockItemEle);
                    // 记录 SubTRS对应节点
                    lockItemEles.push(lockItemEle);

                    // 创建 GLTF节点
                    const gltfNode = scene.createElement(xrFrameSystem.XRGLTF, {
                        model: "gltf-" + id,
                        position: gltfParams.position || "",
                        scale: gltfParams.scale || "",
                        rotation: gltfParams.rotation || "",
                        "anim-autoplay": "",
                    });
                    // 监听 GLTF加载到屏幕的状态
                    gltfNode.event.add("gltf-loaded", (event: { target: XRGLTF }) => {
                        console.log(">>> gltf-loaded", event);
                        if (i.hasEvent) {
                            this.addEvent(event.target, i.id);
                        }
                    });
                    // GLTF节点添加到 SubTRS对应节点
                    lockItemEle.addChild(gltfNode);
                }
            });

            // 识别状态监听
            let waiting = false;
            lockTrackerEl.event.add("ar-tracker-state", (tracker) => {
                // 获取当前状态和错误信息
                const { state, errorMessage } = tracker;
                console.log(">>> errorMessage", errorMessage);
                if (state === 2 && !waiting) {
                    console.log("match");
                    waiting = true;
                    // 识别成功后切换到世界坐标
                    // 延时保证坐标已经设置
                    setTimeout(() => {
                        // 将 lockTrackerEl 的世界矩阵信息同步到 lockItemEle
                        const lockTrackerTrs = lockTrackerEl.getComponent(xrFrameSystem.Transform);
                        lockItemEles.forEach((lockItemEle) => {
                            const lockItemTrs = lockItemEle.getComponent(xrFrameSystem.Transform);
                            lockItemTrs.setLocalMatrix(lockTrackerTrs.worldMatrix);
                            // 记录SubTRS
                            this.gltfItemSubTRS.push(lockItemTrs);
                        });
                        // 记录TRS
                        this.gltfItemTRS.push(lockParentEl.getComponent(xrFrameSystem.Transform));

                        // 去除tracker监听
                        shadowNode.removeChild(lockTrackerEl);

                        // 开启旋转缩放逻辑
                        scene.event.addOnce("touchstart", this.handleTouchStart.bind(this));
                    }, 30);
                }
            });
            // 模型添加到场景中
            shadowNode.addChild(lockParentEl);
        });
    }
    /**
     * 添加事件绑定
     * @param elemt 模型对应GLTF节点
     * @param id 模型id
     */
    addEvent(elemt: any, id: string) {
        const xrFrameSystem = wx.getXrFrameSystem();
        const reduce = (ele: any) => {
            const _ele: Element = ele;
            const mesh: Mesh = _ele.getComponent(xrFrameSystem.Mesh);
            if (mesh) {
                _ele.addComponent(xrFrameSystem.CubeShape, { autoFit: true });
                _ele.addComponent(xrFrameSystem.ShapeGizmos);
                _ele.event.add("touch-shape", (event: { target: Element }) => {
                    const name = event.target.parent.name;
                    console.log(">>> click name", name, event);
                    this.handleTapMesh(mesh, id);
                });
            } else if (ele._children?.length) {
                ele._children.forEach(reduce);
            }
        };
        reduce(elemt);
    }
    /**
     * GLTF模型mesh的点击事件
     * @param mesh Mesh
     * @param id 模型id
     */
    handleTapMesh(mesh: Mesh, id: string) {
        const activeMesh = this.activeMesh;
        const defaultId = id + "-default";
        const activeId = id + "-active";
        const defaultTextureAsset: Texture = this.scene.assets.getAsset(AssetType.TEXTURE, defaultId);
        const activeTextureAsset: Texture = this.scene.assets.getAsset(AssetType.TEXTURE, activeId);
        if (activeMesh) {
            activeMesh.material.setTexture("u_baseColorMap", defaultTextureAsset);
        }
        if (activeMesh !== mesh) {
            mesh.material.setTexture("u_baseColorMap", activeTextureAsset);
        }
        this.activeMesh = mesh === activeMesh ? null : mesh;
    }
    /**
     * 加载资源
     * @param {AssetItem} item 资源参数
     */
    loadAssets(item: AssetItem) {
        const scene = this.scene;
        scene.assets.loadAsset({
            type: item.type,
            assetId: item.id,
            src: item.src,
            options: {},
        });
    }
    /**
     * 监听按键触摸 按下
     * @param event 按键触摸对象
     */
    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
        this.mouseInfo = {
            startX: 0,
            startY: 0,
            isDown: false,
            startPointerDistance: 0,
            state: STATE.NONE,
        };
        this.mouseInfo.isDown = true;

        const touch0 = event.touches[0];
        const touch1 = event.touches[1];

        if (event.touches.length === 1) {
            this.mouseInfo.startX = touch0.pageX;
            this.mouseInfo.startY = touch0.pageY;
            this.mouseInfo.state = STATE.MOVE;
        } else if (event.touches.length === 2) {
            const dx = touch0.pageX - touch1.pageX;
            const dy = touch0.pageY - touch1.pageY;
            this.mouseInfo.startPointerDistance = Math.sqrt(dx * dx + dy * dy);
            this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2;
            this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2;
            this.mouseInfo.state = STATE.ZOOM_OR_PAN;
        }

        this.scene.event.add("touchmove", this.handleTouchMove.bind(this));
        this.scene.event.addOnce("touchend", this.handleTouchEnd.bind(this));
    }
    /**
     * 监听按键触摸 移动
     * @param event 按键触摸对象
     */
    handleTouchMove(event: WechatMiniprogram.TouchEvent) {
        const mouseInfo = this.mouseInfo;
        if (!mouseInfo.isDown) {
            return;
        }

        switch (mouseInfo.state) {
            case STATE.MOVE:
                if (event.touches.length === 1) {
                    this.handleRotate(event);
                } else if (event.touches.length === 2) {
                    // 支持单指变双指，兼容双指操作但是两根手指触屏时间不一致的情况
                    this.scene.event.remove("touchmove", this.handleTouchMove.bind(this));
                    this.scene.event.remove("touchend", this.handleTouchEnd.bind(this));
                    this.handleTouchStart(event);
                }
                break;
            case STATE.ZOOM_OR_PAN:
                if (event.touches.length === 1) {
                    // 感觉双指松掉一指的行为还是不要自动切换成旋转了，实际操作有点奇怪
                } else if (event.touches.length === 2) {
                    this.handleZoomOrPan(event);
                }
                break;
            default:
                break;
        }
    }
    /**
     * 监听按键触摸 松开
     */
    handleTouchEnd() {
        this.mouseInfo.isDown = false;
        this.mouseInfo.state = STATE.NONE;

        this.scene.event.remove("touchmove", this.handleTouchMove.bind(this));
        this.scene.event.addOnce("touchstart", this.handleTouchStart.bind(this));
    }
    /**
     * 旋转操作
     * @param event 按键触摸对象
     */
    handleRotate(event: WechatMiniprogram.TouchEvent) {
        const x = event.touches[0].pageX;
        const y = event.touches[0].pageY;

        const { startX, startY } = this.mouseInfo;

        const theta = ((x - startX) / this.radius) * -this.rotateSpeed;
        const phi = ((y - startY) / this.radius) * -this.rotateSpeed;
        if (Math.abs(theta) < 0.01 && Math.abs(phi) < 0.01) {
            return;
        }
        // this.gltfItemTRS.forEach(gltfItemTRS => {
        //   gltfItemTRS.rotation.x -= phi
        // })
        this.gltfItemSubTRS.forEach((gltfItemSubTRS) => {
            gltfItemSubTRS.rotation.y -= theta;
        });
        this.mouseInfo.startX = x;
        this.mouseInfo.startY = y;
    }
    /**
     * 缩放操作
     * @param event 按键触摸对象
     */
    handleZoomOrPan(event: WechatMiniprogram.TouchEvent) {
        const touch0 = event.touches[0];
        const touch1 = event.touches[1];

        const dx = touch0.pageX - touch1.pageX;
        const dy = touch0.pageY - touch1.pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let deltaScale = distance - this.mouseInfo.startPointerDistance;
        this.mouseInfo.startPointerDistance = distance;
        this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2;
        this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2;
        if (deltaScale < -2) {
            deltaScale = -2;
        } else if (deltaScale > 2) {
            deltaScale = 2;
        }

        const s = deltaScale * 0.02 + 1;
        // 缩小
        this.gltfItemTRS.forEach((gltfItemTRS) => {
            gltfItemTRS.scale.x *= s;
            gltfItemTRS.scale.y *= s;
            gltfItemTRS.scale.z *= s;
        });
    }
}

export { SystemType, AssetType, AssetItem, XrLoader };

export default XrLoader;
