import { PIXI, Scene, Global} from "..";
import { SceneManager } from "..";
import { LoaderScene } from "./LoaderScene";
import { SCENE_HALF_WIDTH, SCENE_HALF_HEIGHT } from '..';
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

        // save levels and quests
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

        const ls = new LoaderScene(this.sceneManager);
        this.sceneManager.AddScene(ls);
        this.sceneManager.ActivateScene(ls); 
    }
}