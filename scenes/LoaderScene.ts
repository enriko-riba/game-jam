import { Global, PIXI, Scene, SceneManager } from "..";
import { GetLevelAssets } from '../world/LevelHelper';
import { stats } from '../objects/PlayerStats';
import { SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT } from '../constants';
import { MasterHud } from '../objects/MasterHud';
import { MainScene } from './MainScene';
import { OptionsScene } from './OptionsScene';
import { CutScene } from './CutScene';


export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;
    private spinner: PIXI.Sprite;

    private readonly preloadAssets : string[] = [  
        //  gui stuff
        'assets/gui-atlas.json',
        // 'assets/gui/gui_fs_enter.png',
        // 'assets/gui/gui_fs_exit.png',
        // 'assets/gui/gui_options.png',
        // 'assets/gui/gui_back.png',
        // 'assets/gui/gui_button1.png',
        // 'assets/gui/gui_slider1.png', 
        // 'assets/gui/gui_minus.png',  

        // 'assets/gui/heart.png',
        // 'assets/gui/coin.png',
        // 'assets/gui/rect.png',
        // 'assets/gui/stat_panel.png',
        // 'assets/gui/exp_panel.png',
        // 'assets/gui/exp_prefill.png',
        // 'assets/gui/exp_fill.png',
        // 'assets/gui/panel.png',

        //
        'assets/hero.png',
        'assets/hero-dead.png',
        'assets/star.png',
        'assets/img/effects/flame.png',
        'assets/img/effects/jump_smoke.png',
        'assets/img/effects/load.png'
    ];

    constructor(scm:SceneManager) {
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
        console.log(`downloading level ${stats.currentGameLevel}...`);
        let assets: string[] = GetLevelAssets(Global.LevelDefinitions, stats.currentGameLevel);
        assets = assets.concat(this.preloadAssets);

        PIXI.loader
            .reset()
            .add(assets)
            .load(this.handleLevelLoading)
            .on("progress", this.onProgress);
    };
   
    private handleLevelLoading = ()=> {        
        if(!this.sceneManager.HasScene("Main")){
            console.log('adding scenes...');    
            this.sceneManager.AddScene(new MainScene(this.sceneManager));
            this.sceneManager.AddScene(new OptionsScene(this.sceneManager));
            this.sceneManager.AddScene(new CutScene(this.sceneManager));
            this.sceneManager.MasterHudOverlay = new MasterHud(this.sceneManager);;
        }

        try {
            let mainScene = this.sceneManager.GetScene("Main") as MainScene;
            mainScene.startLevel();            
        } catch (e) {
            console.log("exception: ", e);
        }
    }

    
    private onProgress = (loader: PIXI.loaders.Loader, resource: PIXI.loaders.Resource) => {
        var progress = loader.progress;
        console.log("progress: " + progress.toFixed(0) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(0) + " %";
    };
}