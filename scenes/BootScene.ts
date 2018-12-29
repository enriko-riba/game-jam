import { PIXI, Scene, Global} from "..";
import { SceneManager } from "..";
import { MasterHud } from "../objects/MasterHud"
import { LoaderScene } from "./LoaderScene";
//import { Toast, configureToasts } from "toaster-js";
import { MainScene } from './MainScene';
import { OptionsScene } from './OptionsScene';
import { SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT } from '..';
import { CutScene } from './CutScene';
import { Quest } from '../QuestSystem/Quest';

const PRELOAD_BOOT_ASSETS = [
    //  cursors
    'assets/gui/cur_default.png',
    'assets/gui/cur_hover.png',
    'assets/gui/cur_target.png',
    'assets/levels.json',
    'assets/quests.json'
];

/**
 * Preloads common assets, after preloading parses user state and starts preloading level assets.
 */
export class BootScene extends Scene {
    private loadingMessage!: PIXI.Text;
    private spinner!: PIXI.Sprite;
    
    
    constructor(scm:SceneManager) {
        super(scm, "Boot");
        this.BackGroundColor = 0;
    }

    public onUpdate = (dt: number)=>{
        if (this.spinner) {
            this.spinner.rotation += 0.05;
        }
    }

    public onActivate = () => {
        this.loadingMessage = new PIXI.Text("booting ...", {
             fontSize: "36px", 
             fontFamily: "Permanent Marker", 
             fill: 0x0ff00, 
             dropShadow: true, 
             stroke: 0x44ff44, 
             strokeThickness: 1 
        });
        this.loadingMessage.anchor.set(0.5, 0.5);
        this.loadingMessage.position.set(SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT - 80);
        this.addChild(this.loadingMessage);

        //------------------------------------------------------
        //  get loading image and define callback on image load
        //------------------------------------------------------
        PIXI.loader.reset()
        .add("assets/loading.png")
        .load(this.startPreloading);
    };
    
    /**
     *  Downloads common assets, JSON files etc.
     */
    private startPreloading = async () => {
        
        //   first add a loading spinner
        var loadingTexture = PIXI.Texture.fromImage("assets/loading.png");
        this.spinner = new PIXI.Sprite(loadingTexture);
        this.spinner.position.set(SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT);
        this.spinner.anchor.set(0.5, 0.5);
        this.spinner.scale.set(0.5);
        this.addChild(this.spinner);
        
        console.log('initializing common assets preloading ...', PRELOAD_BOOT_ASSETS);
        PIXI.loader
            .add(PRELOAD_BOOT_ASSETS)
            .load(this.onPreloadFinished); 
    }

    private onPreloadFinished = async ()=>{
        //  preload of common content is finished
        
        //  setup custom cursors
        var defaultIcon = "url('assets/gui/cur_default.png'),auto";
        var hoverIcon = "url('assets/gui/cur_hover.png'),auto";
        var targetIcon = "url('assets/gui/cur_target.png') 24 24, auto";
        this.sceneManager.Renderer.plugins.interaction.cursorStyles.default = defaultIcon;
        this.sceneManager.Renderer.plugins.interaction.cursorStyles.hover = hoverIcon;
        this.sceneManager.Renderer.plugins.interaction.cursorStyles.target = targetIcon;
        document.body.style.cursor = defaultIcon;

        Global.LevelDefinitions = PIXI.loader.resources["assets/levels.json"].data;
        var questsObj = PIXI.loader.resources["assets/quests.json"].data;
        Global.LevelDefinitions.quests = questsObj.quests as Array<Quest>;
        Global.LevelDefinitions.quests.forEach((q: Quest) => {
            q.itemId = q.itemId || 0;
            q.itemsNeeded = q.itemsNeeded || 0;
            q.itemsCollected = 0;
            q.rewardCoins = q.rewardCoins || 0;
            q.rewardExp = q.rewardExp || 0;
        });


        //  TODO: add assets depending on initial state
        var assets : string[] = [  
            
            //  gui stuff
            'assets/gui/gui_fs_enter.png',
            'assets/gui/gui_fs_exit.png',
            'assets/gui/gui_options.png',
            'assets/gui/gui_back.png',
            'assets/gui/gui_button1.png',
            'assets/gui/gui_slider1.png', 
            'assets/gui/gui_minus.png',  

            'assets/gui/heart.png',
            'assets/gui/coin.png',
            'assets/gui/rect.png',
            'assets/gui/stat_panel.png',
            'assets/gui/exp_panel.png',
            'assets/gui/exp_prefill.png',
            'assets/gui/exp_fill.png',

            //
            'assets/hero.png',
            'assets/hero-dead.png',
            'assets/star.png',
            'assets/img/effects/flame.png',
            'assets/img/effects/jump_smoke.png',
            'assets/img/effects/load.png'
        ];

        const ls = new LoaderScene(this.sceneManager, this.createScenesAndStart, assets);
        this.sceneManager.AddScene(ls);
        this.sceneManager.ActivateScene(ls); 
    }

    private createScenesAndStart = async ()=>{    
        console.log('adding scenes...');    
        this.sceneManager.Renderer.roundPixels = true;
        this.sceneManager.AddScene(new MainScene(this.sceneManager));
        this.sceneManager.AddScene(new OptionsScene(this.sceneManager));
        this.sceneManager.AddScene(new CutScene(this.sceneManager));
        
        //  add master hud overlay and start main scene
        var masterHud = new MasterHud(this.sceneManager);
        this.sceneManager.MasterHudOverlay = masterHud;        
    }
}