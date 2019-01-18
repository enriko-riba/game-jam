import { SceneManager, SpriteButton, SCENE_WIDTH } from "..";

const BTN_X = SCENE_WIDTH - 48;
const BTN_Y = 4;
const BTN_SCALE = 1.0;

/**
 * Implements options and full screen togle buttons.
 */
export class MasterHud extends PIXI.Container {
    constructor(private sceneManager:SceneManager){
        super();

        //----------------------------
        //  full screen toggler
        //----------------------------
        ["", "webkit", "moz", "ms"].forEach(
            prefix => document.addEventListener(prefix + "fullscreenchange", (event) => {
                if (this.isFullScreen) {
                    btnFullScreen.setTexture("assets/gui-atlas.json@gui_fs_exit.png");
                } else {
                    btnFullScreen.setTexture("assets/gui-atlas.json@gui_fs_enter.png");
                }
                btnFullScreen.scale.set(BTN_SCALE);
            }, false)
        );

        //--------------------------------
        //  add full screen, options and 
        //  back buttons
        //--------------------------------       
        var btnFullScreen = new SpriteButton("assets/gui-atlas.json@gui_fs_enter.png", BTN_X, BTN_Y);
        btnFullScreen.onClick = () => this.toggleFullScreen();
        btnFullScreen.scale.set(BTN_SCALE);
        this.addChild(btnFullScreen);

        var btnOptions = new SpriteButton("assets/gui-atlas.json@gui_options.png", BTN_X - 48, BTN_Y);
        btnOptions.onClick = () => this.sceneManager.ActivateScene("Options");
        btnOptions.name = "BTN_OPTIONS";
        btnOptions.scale.set(BTN_SCALE);
        this.addChild(btnOptions);
    }   

    private get isFullScreen(): boolean {
        var doc: any = document;
        return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
    }
    private toggleFullScreen() {
        var doc: any = document;
        var docElm: any = document.documentElement;

        var requestFullScreen = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen || docElm.msRequestFullscreen;
        var exitFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!this.isFullScreen) {
            requestFullScreen.call(docElm);
        } else {
            exitFullScreen.call(doc);
        }
    } 
}