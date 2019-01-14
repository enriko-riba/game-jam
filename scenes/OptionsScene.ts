import { PIXI, Scene, Button, SceneManager } from "..";
import { SCENE_HALF_WIDTH, TEXT_STYLE, SCENE_BACKCOLOR, BTN_WIDTH, SCENE_HEIGHT, BTN_HEIGHT, BTN_STYLE } from '../constants';

/**
 *   Main options GUI.
 */
export class OptionsScene extends Scene {

    private currentMusicTrack: number = 0; 
    

    /**
     *   Creates a new scene instance.
     */
    constructor(scm:SceneManager) {
        super(scm, "Options");
        this.BackGroundColor = SCENE_BACKCOLOR;
        this.setup();
    }

    public onActivate =()=>{
        var btnOptions = this.sceneManager.MasterHudOverlay.children.find((obj, idx)=> obj.name == "BTN_OPTIONS");
        btnOptions!.visible = false;
    }
    public onDeactivate =()=>{
        var btnOptions = this.sceneManager.MasterHudOverlay.children.find((obj, idx)=> obj.name == "BTN_OPTIONS");
        btnOptions!.visible = true;
    }
    private setup = () => {
        var title = new PIXI.extras.BitmapText("Options", TEXT_STYLE);
        this.addChild(title);
        (title.anchor as any).set(0.5);
        title.x = SCENE_HALF_WIDTH;
        title.y = 20;

        let OFFSET = BTN_WIDTH / 3;
        let y = SCENE_HEIGHT - BTN_HEIGHT - OFFSET;

        //--------------------
        //  back to game
        //--------------------
        var btnBack = new Button("assets/gui-atlas.json@gui_button1.png", OFFSET, y, BTN_WIDTH, BTN_HEIGHT);
        btnBack.text = new PIXI.Text("Back to game", BTN_STYLE);
        btnBack.onClick = () => {
            //this.resetSounds();
            this.sceneManager.ActivatePreviousScene();
        };
        this.addChild(btnBack);
    }
}