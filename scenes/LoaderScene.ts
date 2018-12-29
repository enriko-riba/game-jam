import { Global, PIXI, Scene, SceneManager } from "..";
import { GetLevelAssets } from '../world/LevelHelper';
import { stats } from '../objects/PlayerStats';
import { SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT } from '../constants';
import { MainScene } from './MainScene';


export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;
    private spinner: PIXI.Sprite;

    constructor(scm:SceneManager, private onLoaded: () => void, private preloadAssets: string[]) {
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
        this.loadingMessage.position.set(SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT - 80);
        this.addChild(this.loadingMessage);

        var loadingTexture = PIXI.Texture.fromImage("assets/loading.png");
        this.spinner = new PIXI.Sprite(loadingTexture);
        this.spinner.position.set(SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT);
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
        PIXI.loader.reset();
        PIXI.loader
            .add(this.preloadAssets)
            .load(this.handleLoading)
            .on("progress", this.onProgress);
    };
   
    private handleLoading = ()=>{
        //  fire one time callback
        if(this.onLoaded){
            this.onLoaded();
            this.onLoaded = null;
        }
        this.downloadNextLevel();
    }

    private downloadNextLevel = (): void => {
        console.log(`downloading level ${stats.currentGameLevel}...`);
        let assets: string[] = GetLevelAssets(Global.LevelDefinitions, stats.currentGameLevel);
        assets = assets.concat(this.preloadAssets);
        PIXI.loader.reset();
        PIXI.loader
            .add(assets)
            .load(() => {
                //---------------------------------------------
                //  Bootstrap new game scene or reuse existing
                //---------------------------------------------
                try {
                    let mainScene = this.sceneManager.GetScene("Main") as MainScene;
                    mainScene.startLevel();
                    this.sceneManager.ActivateScene(mainScene);
                } catch (e) {
                    console.log("exception: ", e);
                }
            });
    }

    private onProgress = (loader: PIXI.loaders.Loader, resource: PIXI.loaders.Resource) => {
        var progress = loader.progress;
        console.log("progress: " + progress.toFixed(0) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(0) + " %";
    };
}