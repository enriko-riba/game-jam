import { Global, PIXI, Scene, Button, SceneManager } from "..";

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
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
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
        var title = new PIXI.Text("Options", Global.TEXT_STYLE);
        this.addChild(title);
        title.anchor.set(0.5);
        title.x = Global.SCENE_WIDTH/2;
        title.y = 20;

        let OFFSET = Global.BTN_WIDTH / 3;
        let y = Global.SCENE_HEIGHT - Global.BTN_HEIGHT - OFFSET;

        //--------------------
        //  back to game
        //--------------------
        var btnBack = new Button("assets/gui/gui_button1.png", OFFSET, y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnBack.text = new PIXI.Text("Back to game", Global.BTN_STYLE);
        btnBack.onClick = () => {
            //this.resetSounds();
            this.sceneManager.ActivatePreviousScene();
        };
        this.addChild(btnBack);
    }
}