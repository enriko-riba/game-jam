import { PIXI, SceneManager, Global, Dictionary, Scene } from "..";
import * as TWEEN from "@tweenjs/tween.js";

const SCENE_HALF_WIDTH = Global.SCENE_WIDTH / 2;
const SCENE_HALF_HEIGHT = Global.SCENE_HEIGHT / 2;

export class MainScene extends Scene {
    private worldContainer: PIXI.Container;
    
    constructor(scm: SceneManager) {
        super(scm, "Main");
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
        this.worldContainer = new PIXI.Container();        
        this.addChild(this.worldContainer);
    }
}