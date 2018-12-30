import * as particles from "pixi-particles";
import * as TWEEN from "@tweenjs/tween.js";

import { createParticleEmitter } from '../global';
import { ANIMATION_FPS_SLOW, ANIMATION_FPS_NORMAL } from '..';
import { MOVE_TOPIC, GROUND_SHAKE, eventEmitter } from '../events';
import { AnimatedSprite, AnimationSequence, Global } from '..';
import { MovementController, MovementState } from './MovementController';
import { wp2 } from '../world/WorldP2';
import { stats } from './PlayerStats';
import { Mob } from '../mobs/Mob';
import { LevelLoader } from '../world/LevelLoader';
import { IInteractionType } from '../world/LevelInterfaces';
import { snd } from '../world/SoundMan';
import { Bullet } from './Bullet';
import { StatType, AtrType } from '../enums';

const HERO_FRAME_SIZE: number = 64;

export class HeroCharacter extends AnimatedSprite {
    private emitterPixies: particles.Emitter;
    private emitterBurn: particles.Emitter;
    private movementCtrl: MovementController;
    private idleAnimationTimeoutHandle: any;

    constructor(private container: PIXI.Container) {
        super();
        
        this.movementCtrl = new MovementController(wp2);
        wp2.on("playerContact", this.onPlayerContact, this);
        wp2.on("bulletContact", this.onBulletContact, this);

        var cfg = {     
            alpha: {
                start: 0.7,
                end: 0
            },
            blendMode: "normal",
            frequency: 0.01,
            startRotation: {
                min: 265,
                max: 275
            },
            color: {
                start: "#ffffff",
                end: "#ff5050"
            },
            speed: {
                start: 1,
                end: 0.5,
                minimumSpeedMultiplier: 1
            },
            scale: {
                start: 0.2,
                end: 0.6
            },
            maxParticles: 20,
            lifetime: {
                min: 0.25,
                max: 0.75
            },
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: HERO_FRAME_SIZE-25,
                r: 25
            }
        };
        //    attached to hero sprite
        this.emitterBurn = createParticleEmitter(this, [PIXI.Texture.fromImage("assets/img/effects/flame.png")], cfg);  
        //   attached to container since it must emit outside hero sprite
        this.emitterPixies = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/star.png")]);  

        const asset = "assets/hero.png";
        this.addAnimations(new AnimationSequence("right", asset, [18, 19, 20, 21, 22, 23], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("left", asset, [12, 13, 14, 15, 16, 17], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpleft", asset, [24, 25, 26, 27, 28, 29], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpright", asset, [30, 31, 32, 33, 34, 35], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpup", asset, [1, 3, 4, 6], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("idle", asset, [1, 1, 0, 1, 2, 3, , 4, 5, 13, 12, 6, 7, 11, 18, 19, 0], HERO_FRAME_SIZE, HERO_FRAME_SIZE));

        this.addAnimations(new AnimationSequence("jumpdownleft", asset, [36, 37, 38], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdownright", asset, [39, 40, 41], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdown", asset, [42, 43, 44], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        this.anchor.set(0.5, 0.58);

        eventEmitter.on(MOVE_TOPIC, this.onPlayerMove);
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
    public onUpdate = (dt: number) => {
        this.position.x = Global.position.x;
        this.position.y = Global.position.y;

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
        this.emitterBurn.update(dt * 0.001);

        //--------------------------
        //  check if running
        //--------------------------
        if (this.movementCtrl.IsRunning && this.movementCtrl.MovementState !== MovementState.Idle) {
            stats.increaseStat(StatType.Dust, -dt * 0.005);   //  5/sec
            let angle = 8;
            let degree = Math.PI * angle / 180;
            this.rotation = (this.movementCtrl.MovementState === MovementState.Left) ? degree : -degree;
        } else {
            this.rotation = 0;
        }
        this.emitterBurn.emit = stats.isBurning;
        super.onUpdate(dt);        
    };

    private onPlayerMove = (event: any) => {
        var state: MovementState = event.newState as MovementState;
        var fps = event.isRunning ? ANIMATION_FPS_NORMAL * 1.6 : ANIMATION_FPS_NORMAL;
        switch (state) {
            case MovementState.Idle:
                if(this.idleAnimationTimeoutHandle) clearTimeout(this.idleAnimationTimeoutHandle);
                this.idleAnimationTimeoutHandle = setTimeout(() => {
                    this.play("idle", ANIMATION_FPS_SLOW);
                    snd.idle();
                }, 300);
                break;
            case MovementState.Left:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("left", fps);
                snd.walk(event.isRunning);
                break;
            case MovementState.Right:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("right", fps);
                snd.walk(event.isRunning);
                break;
            case MovementState.JumpLeft:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("jumpleft", fps);
                snd.jump();
                break;
            case MovementState.JumpRight:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("jumpright", fps);
                snd.jump();
                break;
            case MovementState.JumpUp:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("jumpup", fps);
                snd.jump();
                break;
            case MovementState.JumpDownLeft:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("jumpdownleft", fps);
                snd.jumpAttack();
                break;
            case MovementState.JumpDownRight:
                clearTimeout(this.idleAnimationTimeoutHandle);
                this.play("jumpdownright", fps);
                snd.jumpAttack();
                break;
        }
    }

    /**
     * Checks if the player has jumped on something with a high velocity.
     * Adds smoke for ground contacts and handles mob collision for npc's.
     *
     * @param event
     */
    private onPlayerContact(event: any): void {
        const SND_TRESHOLD_VELOCITY: number = 400;
        const SMOKE_VELOCITY: number = 450;
        const ATTACK_VELOCITY: number = 550;

        let body: p2.Body = event.body as p2.Body;
        var mob: Mob = event.body.DisplayObject as Mob;

        let verticalVelocity = Math.abs(event.velocity[1]);
       
        if (verticalVelocity > ATTACK_VELOCITY) {
            //console.log("Vert velocity: " + verticalVelocity);
            //  check collision vs mobs
            if (mob instanceof Mob) {
                if (!mob.isLoading) {
                    this.handleMobInteraction(mob, body);
                }
            }

            var movementState = this.movementCtrl.MovementState;
            if (movementState === MovementState.JumpDown || 
                movementState === MovementState.JumpDownLeft ||
                movementState === MovementState.JumpDownRight
            ) {
                snd.jumpContact();
                eventEmitter.emit(GROUND_SHAKE, {milliSeconds: 600, magnitudeInPixels: 9});
                return;
            }
        } 
        
        if (verticalVelocity > SMOKE_VELOCITY) {
            console.log("Vert velocity: " + verticalVelocity);
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
        
        if(verticalVelocity > SND_TRESHOLD_VELOCITY){
            snd.jumpContact();
            console.log("velocity: " + event.velocity);
        }
    }

    /**
     * Handles bullets hitting the player or obstacle.
     *
     * @param event
     */
    private onBulletContact(event: any): void {
        let bullet: Bullet = event.bulletBody.DisplayObject as Bullet;
        if (!bullet.IsDead) {
            if (event.playerHit) {
                snd.hitPain();
                //this.hud.addInfoMessage(this.position, `${-bullet.damage} HP`, MSG_HP_STYLE, 50);
                stats.increaseStat(StatType.HP, -bullet.damage);
            } else {

                //  TODO: recycle explode animations
                var explode: AnimatedSprite = new AnimatedSprite();
                explode.addAnimations(new AnimationSequence("exp",
                    "assets/img/effects/slime_atk_exp.png",
                    [0, 1, 2, 3, 4, 5], 32, 32)
                );
                explode.anchor.set(0.5);
                explode.pivot.set(0.5);
                explode.x = bullet.x;
                explode.y = bullet.y;
                explode.alpha = 0.7;
                explode.rotation = Math.random() * Math.PI;
                this.container.addChild(explode);
                explode.onComplete = () => this.container.removeChild(explode);
                explode.play("exp", 10, false);
                snd.bulletHitWall();
            }
            bullet.IsDead = true;
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
                var dropItemBody = LevelLoader.createEntity(stats.currentLevel.templates, it.drop.entity);
                this.addDropItem(mob, dropItemBody);
            }
            
        }

        this.removeEntity(body);
        mob.squish(() => this.container.removeChild(dispObj));
        

        //  add exp       
        var exp = mob.attributes[AtrType.HP] / 2;
        stats.increaseStat(StatType.TotalExp, exp);
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
                wp2.addBody(itemBody);
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
        wp2.removeBody(body);
        if (removeDisplayObject) {
            this.container.removeChild((body as any).DisplayObject);
        }
        (body as any).DisplayObject = null;
    }
}