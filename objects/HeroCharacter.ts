import { SCENE_HALF_WIDTH, eventEmitter } from './../global';
import { AnimatedSprite, AnimationSequence, Global } from '..';
import { MovementController, MovementState } from './MovementController';
import { WorldP2 } from './WorldP2';
import * as particles from "pixi-particles";
import { StatType } from './PlayerStats';

export class HeroCharacter extends AnimatedSprite {
    private readonly HERO_FRAME_SIZE: number = 64;
    private emitterPixies: particles.Emitter;
    private emitterBuffs: particles.Emitter;
    private movementCtrl: MovementController;
    private wp2: WorldP2;

    constructor(container: PIXI.Container) {
        super();
        this.emitterPixies = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/star.png")]);
        this.emitterPixies.emit = true;
        var cfg = {
            color: { start: "#ff0000", end: "#ff5050" },
            alpha: { start: 1, end: 0.5 },
            speed: {
                start: 1,
                end: 0,
                minimumSpeedMultiplier: 1
            },
            scale: {
                start: 0.3,
                end: 0.05
            },
            maxParticles: 70,
            lifetime: {
                min: 0.3,
                max: 0.6
            },
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: 40,
                r: 30
            }
        };
        this.emitterBuffs = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/flame.png")], cfg);
        this.emitterBuffs.emit = false;
        const asset = "assets/Hero.png";
        this.addAnimations(new AnimationSequence("right", asset, [18, 19, 20, 21, 22, 23], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("left", asset, [12, 13, 14, 15, 16, 17], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpleft", asset, [24, 25, 26, 27, 28, 29], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpright", asset, [30, 31, 32, 33, 34, 35], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpup", asset, [1, 3, 4, 6], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("idle", asset, [1, 1, 34, 5, 13, 12, 6, 7, 11, 18, 19, 0, 1, 1], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));

        this.addAnimations(new AnimationSequence("jumpdownleft", asset, [36, 37, 38], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdownright", asset, [39, 40, 41], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdown", asset, [42, 43, 44], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.anchor.set(0.5, 0.58);

        eventEmitter.on(Global.MOVE_TOPIC, (event: any) => {
            console.log('move topic, event: ', event);
            var state: MovementState = event.newState as MovementState;
            switch (state) {
                case MovementState.Idle:
                    this.play("idle", Global.ANIMATION_FPS_SLOW);
                    break;
                case MovementState.Left:
                    this.play("left", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.Right:
                    this.play("right", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.JumpLeft:
                    this.play("jumpleft", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.JumpRight:
                    this.play("jumpright", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.JumpUp:
                    this.play("jumpup", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.JumpDownLeft:
                    this.play("jumpdownleft", Global.ANIMATION_FPS_NORMAL);
                    break;
                case MovementState.JumpDownRight:
                    this.play("jumpdownright", Global.ANIMATION_FPS_NORMAL);
                    break;
            }
        })
    }

    /**
    *  Returns the current movement state.
    */
    public get MovementState() {
        return this.movementCtrl.MovementState;
    }

    /**
     * Sets the physics world instance.
     */
    public SetWorldP2(wp2: WorldP2) {
        this.wp2 = wp2;
        this.movementCtrl = new MovementController(this.wp2);
    }

    /**
     * Returns if the player can interact via controls.
     */
    public get IsInteractive(): boolean {
        return this.movementCtrl.isInteractive;
    }

    /**
     * Sets if the player can interact via controls.
     */
    public set IsInteractive(newValue: boolean) {
        this.movementCtrl.isInteractive = newValue;
    }

    /**
     * Checks movementCtrl.MovementState and updates pixi dust emitter and consumption.
     * @param dt elapsed time in milliseconds
     */
    public update = (dt: number) => {
        this.position.x = Global.stats.position.x;
        this.position.y = Global.stats.position.y;

        if (this.IsInteractive) {
            this.movementCtrl.update(dt);
        }

        switch (this.movementCtrl.MovementState) {
            case MovementState.Idle:
                this.emitterPixies.emit = false;
                break;
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = -25;
                this.emitterPixies.maxStartRotation = 25;
                break;
            case MovementState.Right:
            case MovementState.JumpRight:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = 155;
                this.emitterPixies.maxStartRotation = 205;
                break;

            case MovementState.JumpUp:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = 245;
                this.emitterPixies.maxStartRotation = 295;
                break;
        }

        this.emitterPixies.update(dt * 0.001);
        (this.emitterPixies.ownerPos as any) = this.position;
        this.emitterBuffs.update(dt * 0.001);
        (this.emitterBuffs.ownerPos as any) = this.position;

        //--------------------------
        //  check if running
        //--------------------------
        if (this.movementCtrl.IsRunning && this.movementCtrl.MovementState !== MovementState.Idle) {
            Global.stats.increaseStat(StatType.Dust, -dt * 0.005);   //  5/sec
            let angle = 8;
            let degree = Math.PI * 2 * angle / 360;
            this.rotation = (this.movementCtrl.MovementState === MovementState.Left) ? degree : -degree;
        } else {
            this.rotation = 0;
        }

        //--------------------------
        //  check if is burning
        //--------------------------
        let wasBurning = this._isBurning;
        let now = performance.now() / 1000;
        this._isBurning = Global.stats.buffs[1000] > now || Global.stats.buffs[1001] > now;
        this.alpha = (this._isBurning) ? 0.7 : 1;

        if (wasBurning !== this._isBurning) {
            const BURN_TOPIC = "BURN";
            eventEmitter.emit(BURN_TOPIC, { wasBurning: wasBurning, isBurning: this._isBurning });
        }

        Global.stats.onUpdate(dt);
    };

    private _isBurning: boolean = false;

    /**
     * Returns true if the player is taking burn damage.
     */
    public get isBurning() {
        return this._isBurning;
    }

    /**
     * Returns true if the player is jumping.
     */
    public get isJumping() {
        return this.movementCtrl.IsJumping;
    }
}

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
            start: 40,
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
    return emitter;
}