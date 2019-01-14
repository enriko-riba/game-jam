import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";
import { SceneManager } from "pixi-scenegraph";
import { IRootObject } from './world/LevelInterfaces';
import { SCENE_HEIGHT, SCENE_WIDTH } from './constants';



/**
 * The global scene manager.
 */
export function getScm() {
    if (!sceneManager) {
        const canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        const renderOptions: PIXI.RendererOptions = {
            view: canvas,
            backgroundColor: 0,
            antialias: false,
            transparent: false,
            roundPixels: false,
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

/**
 * Player position.
 */
export var position = new PIXI.Point();

export var worldContainer : PIXI.Container;

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
        cfg = { ...cfg, ...config };
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

export var LevelDefinitions: IRootObject = {
        templates: undefined,
        levels: undefined,
        quests: undefined
};