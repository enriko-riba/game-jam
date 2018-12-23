import { SceneManager } from "./_engine";
import { PlayerStats } from './objects/PlayerStats';
import * as PIXI from "pixi.js";

export const SCENE_WIDTH: number = 1920;
export const SCENE_HEIGHT: number = 1080;
export const SCENE_HALF_WIDTH = SCENE_WIDTH / 2;
export const SCENE_HALF_HEIGHT = SCENE_HEIGHT / 2;
export const BTN_WIDTH: number = 120;
export const BTN_HEIGHT: number = 60;
export const MENU_LINE_HEIGHT = 60;
export const GUI_FONT =  "Orbitron";

export const SCENE_BACKCOLOR = 0x112233;

export const BTN_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 28,
    fontFamily: GUI_FONT,
    fill: 0x46fbfd,
    strokeThickness: 1,
    stroke: 0x0
};

export const TEXT_STYLE: PIXI.TextStyleOptions = {
    align: "left",
    padding: 0,
    fontSize: 22,
    fontFamily: GUI_FONT,
    fill: 0xaaaa13,
    strokeThickness: 3,
    stroke: 0x0f0f2f,
};

/**
 * The global scene manager.
 */
export function getScm(){
    if(!sceneManager){
        const canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        const renderOptions: PIXI.RendererOptions = {
            view: canvas,
            backgroundColor: 0,
            antialias: true,
            transparent: false,
            roundPixels: true,
            resolution: window.devicePixelRatio
        };
        sceneManager = new SceneManager(SCENE_WIDTH, SCENE_HEIGHT, renderOptions);
    }
    return sceneManager;        
}
export function deleteScm(){
    if(sceneManager){
        sceneManager.Renderer.destroy();
    }
    (sceneManager as any) = undefined;        
}
let sceneManager : SceneManager;

export var stats = new PlayerStats();


export var eventEmitter = new PIXI.utils.EventEmitter();
export var MOVE_TOPIC = "move_changed";
export var BURN_TOPIC = "BURN";
export var STATCHANGE_TOPIC = "stat_changed";
export var DPS_TOPIC = "dps_changed";
export var ANIMATION_FPS_NORMAL = 12;
export var ANIMATION_FPS_SLOW = 4;