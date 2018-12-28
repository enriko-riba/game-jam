import { eventEmitter, MOVE_TOPIC, ANIMATION_FPS_SLOW, ANIMATION_FPS_NORMAL, createParticleEmitter } from './../global';
import { AnimatedSprite, AnimationSequence, Global } from '..';
import { MovementController, MovementState } from './MovementController';
import { WorldP2 } from './WorldP2';
import * as particles from "pixi-particles";
import { StatType } from './PlayerStats';
import { Mob, AtrType } from '../mobs/Mob';
import { IInteractionType, LevelLoader } from './LevelLoader';

const HERO_FRAME_SIZE: number = 64;

export class HeroCharacter extends AnimatedSprite {
    private emitterPixies: particles.Emitter;
    private emitterBuffs: particles.Emitter;
    private movementCtrl: MovementController;
    private wp2: WorldP2;

    constructor(private container: PIXI.Container) {
        super();
        
        var cfg = {
            color: { start: "#ff0000", end: "#ff3050" },
            alpha: { start: 1, end: 0.5 },
            speed: {
                start: 1,
                end: 0,
                minimumSpeedMultiplier: 1
            },
            scale: {
                start: 0.6,
                end: 0.15
            },
            maxParticles: 70,
            lifetime: {
                min: 0.1,
                max: 0.3
            },
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: 40,
                r: 30
            }
        };
        this.emitterBuffs = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/img/effects/flame.png")], cfg);
        this.emitterPixies = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/star.png")]);
        const asset = "assets/Hero.png";
        this.addAnimations(new AnimationSequence("right", asset, [18, 19, 20, 21, 22, 23], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("left", asset, [12, 13, 14, 15, 16, 17], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpleft", asset, [24, 25, 26, 27, 28, 29], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpright", asset, [30, 31, 32, 33, 34, 35], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpup", asset, [1, 3, 4, 6], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("idle", asset, [1, 1, 34, 5, 13, 12, 6, 7, 11, 18, 19, 0, 1, 1], HERO_FRAME_SIZE, HERO_FRAME_SIZE));

        this.addAnimations(new AnimationSequence("jumpdownleft", asset, [36, 37, 38], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdownright", asset, [39, 40, 41], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdown", asset, [42, 43, 44], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.anchor.set(0.5, 0.58);

        eventEmitter.on(MOVE_TOPIC, (event: any) => {
            var state: MovementState = event.newState as MovementState;
            var fps = event.isRunning ? ANIMATION_FPS_NORMAL * 1.6 : ANIMATION_FPS_NORMAL;
            switch (state) {
                case MovementState.Idle:
                    this.play("idle", ANIMATION_FPS_SLOW);
                    break;
                case MovementState.Left:
                    this.play("left", fps);
                    break;
                case MovementState.Right:
                    this.play("right", fps);
                    break;
                case MovementState.JumpLeft:
                    this.play("jumpleft", fps);
                    break;
                case MovementState.JumpRight:
                    this.play("jumpright", fps);
                    break;
                case MovementState.JumpUp:
                    this.play("jumpup", fps);
                    break;
                case MovementState.JumpDownLeft:
                    this.play("jumpdownleft", fps);
                    break;
                case MovementState.JumpDownRight:
                    this.play("jumpdownright", fps);
                    break;
            }
        });
    }

    /**
     * Sets the physics world instance.
     */
    public SetWorldP2(wp2: WorldP2) {
        this.wp2 = wp2;
        this.movementCtrl = new MovementController(this.wp2);

        this.wp2.on("playerContact", this.onPlayerContact, this);
        //this.wp2.on("bulletContact", this.onBulletContact, this);
    }

    /**
    *  Returns the current movement state.
    */
    public get MovementState() {
        return this.movementCtrl.MovementState;
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
     * Returns true if the player is jumping.
     */
    public get isJumping() {
        return this.movementCtrl.IsJumping;
    }


    /**
     * Checks movementCtrl.MovementState and updates pixi dust emitter and consumption.
     * @param dt elapsed time in milliseconds
     */
    public onUpdate = (dt: number) => {
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
        this.emitterPixies.updateOwnerPos(this.position.x, this.position.y);
        this.emitterBuffs.update(dt * 0.001);
        this.emitterBuffs.updateOwnerPos(this.position.x, this.position.y);

        //--------------------------
        //  check if running
        //--------------------------
        if (this.movementCtrl.IsRunning && this.movementCtrl.MovementState !== MovementState.Idle) {
            Global.stats.increaseStat(StatType.Dust, -dt * 0.005);   //  5/sec
            let angle = 8;
            let degree = Math.PI * angle / 180;
            this.rotation = (this.movementCtrl.MovementState === MovementState.Left) ? degree : -degree;
        } else {
            this.rotation = 0;
        }
        this.emitterBuffs.emit = Global.stats.isBurning;
        this.alpha = (Global.stats.isBurning) ? 0.7 : 1;
        super.onUpdate(dt);        
    };

    /**
     * Checks if the player has jumped on something with a high velocity.
     * Adds smoke for ground contacts and handles mob collision for npc's.
     *
     * @param event
     */
    private onPlayerContact(event: any): void {
        const SMOKE_VELOCITY: number = 430;
        const ATTACK_VELOCITY: number = 545;

        let body: p2.Body = event.body as p2.Body;
        let verticalVelocity = Math.abs(event.velocity[1]);
       
        if (verticalVelocity > ATTACK_VELOCITY) {
            //console.log("Vert velocity: " + verticalVelocity);

            //  check collision vs mobs
            var mob: Mob = (body as any).DisplayObject as Mob;
            if (mob instanceof Mob) {
                if (!mob.isLoading) {
                    this.handleMobInteraction(mob, body);
                }
            }
            if (this.MovementState === MovementState.JumpDown || 
                this.MovementState === MovementState.JumpDownLeft ||
                this.MovementState === MovementState.JumpDownRight
            ) {
                //TODO: implement
                //this.startGroundShake(400, 6);
            }
        } else if (verticalVelocity > SMOKE_VELOCITY) {
            //console.log("Vert velocity: " + verticalVelocity);
            var smoke: AnimatedSprite = new AnimatedSprite();
            smoke.addAnimations(new AnimationSequence("smoke", "assets/img/effects/jump_smoke.png",
                [0, 1, 2, 3, 4, 5], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
            smoke.anchor.set(0.5);
            smoke.pivot.set(0.5);
            smoke.x = this.x;
            smoke.y = this.y - 25;
            smoke.alpha = 0.7;
            smoke.rotation = Math.random() * Math.PI;
            this.container.addChild(smoke);
            smoke.onComplete = () => this.container.removeChild(smoke);
            smoke.play("smoke", 6, false);
        }
    }

    /**
     * Handles interaction with mobs (mob kill).
     * @param mob
     * @param body
     */
    private handleMobInteraction(mob: Mob, body: p2.Body) {
        let dispObj = (body as any).DisplayObject as PIXI.DisplayObject;
        let it = dispObj as IInteractionType;

        //  generate drop
        if (it.drop) {
            let isDropping = Math.random() <= it.drop.chance;
            if (isDropping) {
                var dropItemBody = LevelLoader.createEntity(Global.stats.currentLevel.templates, it.drop.entity);
                this.addDropItem(mob, dropItemBody);
            }
            
        }

        this.removeEntity(body);
        mob.squish(() => this.container.removeChild(dispObj));
        //Global.snd.mobSquish();

        //  add exp       
        var exp = mob.attributes[AtrType.HP] / 2;
        Global.stats.increaseStat(StatType.TotalExp, exp);
        //this.hud.addInfoMessage(mob.position, `+${exp} exp`, null, -50);
    }

    /**
     * Adds an drop item to the scene with a tween animation.
     * @param dispObj
     */
    private addDropItem(mob: Mob, itemBody: p2.Body): void {
        let dispObj = (itemBody as any).DisplayObject as PIXI.DisplayObject;
        dispObj.x = mob.x;
        dispObj.y = mob.y + 40;
        this.container.addChild(dispObj);

        //  tween from mob position to random position near hero
        var upX = dispObj.position.x + 75;
        var upY = dispObj.position.y + 200;
        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 400)
            .onComplete(() => {
                itemBody.position = [dispObj.position.x, dispObj.position.y];
                this.wp2.addBody(itemBody);
            });


        var orgScaleX = dispObj.scale.x;
        var orgScaleY = dispObj.scale.y;
        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.3, y: orgScaleX + 0.3 }, 350)
            .easing(TWEEN.Easing.Linear.None);

        var endX = this.x;
        var endY = this.y + 10;
        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 350)
            .easing(TWEEN.Easing.Back.In)
            .onUpdate((pos: PIXI.Point) => {
                itemBody.position = [dispObj.position.x, dispObj.position.y];
            })
            .onComplete(() => dispObj.scale.set(orgScaleX, orgScaleY));

        moveUp.chain(scale, moveAway).start();
    }

    /**
     * Removes an entity from the p2 world and sets its DisplayObject to null.
     * If the removeDisplayObject is true the display object will be also removed from the worldContainer
     *
     * @param body
     * @param removeDisplayObject
     */
    public removeEntity(body: p2.Body, removeDisplayObject: boolean = false): void {
        this.wp2.removeBody(body);
        if (removeDisplayObject) {
            this.container.removeChild((body as any).DisplayObject);
        }
        (body as any).DisplayObject = null;
    }
}