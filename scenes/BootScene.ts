import { Global, PIXI, Scene} from "..";
import { SceneManager } from "..";
import { MasterHud } from "../objects/MasterHud"
import { LoaderScene } from "./LoaderScene";
import { Toast, configureToasts } from "toaster-js";
import { MainScene } from './MainScene';
import { OptionsScene } from './OptionsScene';

const PRELOAD_BOOT_ASSETS = [
    //  cursors
    'assets/gui/cur_default.png',
    'assets/gui/cur_hover.png',
    'assets/gui/cur_target.png',
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
        this.loadingMessage.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT / 2 - 80);
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
        this.spinner.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT / 2);
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
            'assets/gui/gui_plus.png',

            //  backgrounds and parallax
            'assets/img/Canyon.png',
            'assets/img/front01.png',
            'assets/img/ground.png',
            'assets/img/IceSnow.png',
            'assets/img/Mountains.png',
            'assets/img/trees01.png',
            'assets/img/trees02.png',
            'assets/img/trees03.png',
            'assets/img/trees04.png',
            'assets/img/trees05.png',
            'assets/img/trees06.png',
            'assets/img/trees07.png',
            'assets/img/trees08.png',

        ];

        const ls = new LoaderScene(this.sceneManager, this.createScenesAndStart, assets);
        this.sceneManager.AddScene(ls);
        this.sceneManager.ActivateScene(ls); 
    }

    private createScenesAndStart = async ()=>{        
        configureToasts({
            topOrigin: -20
        });

        this.sceneManager.Renderer.roundPixels = true;
        this.sceneManager.AddScene(new MainScene(this.sceneManager));
        this.sceneManager.AddScene(new OptionsScene(this.sceneManager));
        
        //   TODO: add scenes

        //  add master hud overlay
        var masterHud = new MasterHud(this.sceneManager);
        this.sceneManager.MasterHudOverlay = masterHud;

        this.sceneManager.ActivateScene("Main");
    }
}