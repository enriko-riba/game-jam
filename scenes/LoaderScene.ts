import { Global, PIXI, Scene, SceneManager } from "..";

export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;
    private spinner: PIXI.Sprite;

    constructor(scm:SceneManager, private onLoaded: () => void, private preloadAsdsets: string[]) {
        super(scm, "Loader");
        this.BackGroundColor = 0;
        this.loadingMessage = new PIXI.Text("loading ...", { 
            fontSize: 36, 
            fontFamily: "Permanent Marker", 
            fill: 0x0ff00, 
            dropShadow: true, 
            align: "center",
            stroke: 0x44ff44, 
            strokeThickness: 1
        });
        this.loadingMessage.anchor.set(0.5, 0.5);
        this.loadingMessage.position.set(Global.SCENE_HALF_WIDTH, Global.SCENE_HALF_HEIGHT - 80);
        this.addChild(this.loadingMessage);

        var loadingTexture = PIXI.Texture.fromImage("assets/loading.png");
        this.spinner = new PIXI.Sprite(loadingTexture);
        this.spinner.position.set(Global.SCENE_HALF_WIDTH, Global.SCENE_HALF_HEIGHT);
        this.spinner.anchor.set(0.5, 0.5);
        this.spinner.scale.set(0.5);
        this.addChild(this.spinner); 
    }

    public onUpdate = (dt: number)=>{
        if (this.spinner) {
            this.spinner.rotation += 0.05;
        }
    }

    public onActivate = () => {       
        PIXI.loader
            .add(this.preloadAsdsets)
            .load(this.onLoaded)
            .on("progress", this.onProgress);
    };    

    private onProgress = (loader: PIXI.loaders.Loader, resource: PIXI.loaders.Resource) => {
        var progress = loader.progress;
        console.log("progress: " + progress.toFixed(0) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(0) + " %";
    };
}