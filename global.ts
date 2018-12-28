import { SceneManager } from "./_engine";
import { PlayerStats } from './objects/PlayerStats';
import { IRootObject } from './objects/LevelLoader';
import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";

export const SCENE_WIDTH: number = 1920;
export const SCENE_HEIGHT: number = 1080;
export const SCENE_HALF_WIDTH = SCENE_WIDTH / 2;
export const SCENE_HALF_HEIGHT = SCENE_HEIGHT / 2;
export const BTN_WIDTH: number = 120;
export const BTN_HEIGHT: number = 60;
export const MENU_LINE_HEIGHT = 60;
export const GUI_FONT = "Orbitron";

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

export var MSG_COIN_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 22,
    fontFamily: GUI_FONT,
    fill: 0xaaaa00,
    strokeThickness: 3,
    stroke: 0x904b15
};

export var MSG_HP_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 24,
    fontFamily: GUI_FONT,
    fill: 0x904b15,
    strokeThickness: 3,
    stroke: 0x111111
};
export var MSG_WARN_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 27,
    fontFamily: GUI_FONT,
    fill: 0xff0011,
    strokeThickness: 4,
    stroke: 0x222222
};

export var EXP_BAR_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: "13px",
    fontFamily: GUI_FONT,
    fill: 0x111111,
    strokeThickness: 4,
    stroke: 0xffffff
};

/**
 * The global scene manager.
 */
export function getScm() {
    if (!sceneManager) {
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
export function deleteScm() {
    if (sceneManager) {
        sceneManager.Renderer.destroy();
    }
    (sceneManager as any) = undefined;
}
let sceneManager: SceneManager;

export var stats = new PlayerStats();




export var ANIMATION_FPS_NORMAL = 14;
export var ANIMATION_FPS_SLOW = 4;

export var eventEmitter = new PIXI.utils.EventEmitter();
export var MOVE_TOPIC = "MOVE";
export var BURN_TOPIC = "BURN";
export var STATCHANGE_TOPIC = "stat_changed";
export var DAMAGE_TOPIC = "DAMAGE";


export function createParticleEmitter(container: PIXI.Container, textures: PIXI.Texture[], config?: any): particles.Emitter {
    "use strict";
    var cfg: any = {
        alpha: {
            start: 0.8,
            end: 0.03
        },
        color: {
            start: "#dcff09",
            end: "#9f1f1f"
        },
        scale: {
            start: 0.1,
            end: 0.4,
            minimumScaleMultiplier: 1
        },
        speed: {
            start: 50,
            end: 3,
            minimumSpeedMultiplier: 1
        },
        acceleration: new PIXI.Point(),
        startRotation: {
            min: 0,
            max: 360
        },
        rotationSpeed: {
            min: 5,
            max: 20
        },
        lifetime: {
            min: 0.4,
            max: 1.0
        },
        blendMode: "add",
        frequency: 0.01,
        emitterLifetime: -1,
        maxParticles: 200,
        pos: new PIXI.Point(0, -24),
        addAtBack: false,
        spawnType: "circle",
        spawnCircle: {
            x: 0,
            y: 0,
            r: 10
        }
    };
    if (config) {
        cfg = { ...cfg, config };
    }

    var emitter = new particles.Emitter(
        // the PIXI.Container to put the emitter in
        // if using blend modes, it's important to put this
        // on top of a bitmap, and not use the root stage Container
        container,
        textures,
        cfg
    );
    emitter.emit = false;
    return emitter;
}

export var GameLevels: IRootObject = {
        templates: undefined,
        levels: undefined,
        //quests: undefined
    };