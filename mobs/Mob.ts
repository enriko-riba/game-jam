import { AnimatedSprite, AnimationSequence } from "../_engine/AnimatedSprite";
import { Bullet } from "../objects/Bullet";
import { snd } from "../world/SoundMan";
import { AI } from "./AI";
import { BasicStaticAI } from "./BasicStaticAI";
import { wp2 } from '../world/WorldP2';
import { DirectionH, AtrType } from '../enums';

const FRAME_SIZE: number = 48;



/**
 * Represents a monster entity
 */
export class Mob extends AnimatedSprite {

    private onDeathCallBack: () => void;
    private _isDead: boolean = false;
    private _attributes: number[];
    private _ai: AI;
    private _direction: DirectionH;
    
    constructor(private textureName: string) {
        super();

        this.addAnimations(new AnimationSequence("left", this.textureName, [0, 1, 2], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("right", this.textureName, [3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("latk", this.textureName, [6, 7, 8], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("ratk", this.textureName, [9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("lsquish", this.textureName, [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("rsquish", this.textureName, [18, 19, 20, 21, 22, 23], FRAME_SIZE, FRAME_SIZE));
        this.play("left");   
        this._direction = DirectionH.Left;      
    }

    public isLoading: boolean = false;

    public get isDead() {
        return this._isDead;
    }
    public set isDead(value: boolean) {
        if (value != this._isDead) {
            this._isDead = value;
            if (this._isDead && this.onDeathCallBack) {
                this.onDeathCallBack();
            }
        }
    }

    public set onDeath(cb: () => void) {
        this.onDeathCallBack = cb;
    }
    public get onDeath(): () => void {
        return this.onDeathCallBack;
    }


    /**
     * texture used for attacks emitted by the mob.
     */
    public atkTexture: string | string[];

    /**
     * Kills the mob, plays squish animation and sound. Optionaly invokes the call back on animation end.
     * @param cb
     */
    public squish(cb?: () => void) {     
        this.isDead = true;   
        var aname = (this._direction == DirectionH.Left ? "lsquish" : "rsquish");
        this.onComplete = cb;
        this.play(aname, 12, false);
        snd.mobSquish();
    }

    public get direction(): DirectionH {
        return this._direction;
    }
    public set direction(dir: DirectionH) {
        if (this._direction != dir) {
            this._direction = dir;
            if (dir === DirectionH.Left) {
                this.play("left");
            } else {
                this.play("right");
            }
        }
    }

    public set attributes(values: number[]) {
        this._attributes = values;
    }
    public get attributes(): number[] {
        return this._attributes;
    }

    public attack = ()=> {
        var currentSeq = this.currentSequence;
        var currentFps = this.fps;
        snd.atkMagic1();
        if (this._direction == DirectionH.Left) {
            this.play("latk", currentFps, false);
        } else {
            this.play("ratk", currentFps, false);
        }

        this.onComplete = (seq: AnimationSequence) => {
            this.onComplete = null;
            this.fireBullet();
            this.play(currentSeq.sequenceName, currentFps);
        };
    }

    private fireBullet() {
        if (this.atkTexture.constructor === Array) {
            //  TODO: animated sprite
        } else {
            //  sprite
            Bullet.emitBullet(this.atkTexture as string, this.position, wp2.playerBody.position, this._attributes[AtrType.Atk]);
        }
    }

    public createAI(aiTypeName: string):void {
        switch (aiTypeName.toLowerCase()) {
            case "basic_static":
                this._ai = new BasicStaticAI(this);
                break;

            case "basic":
                //  TODO: implement AI logic variations 
                break;
        }
    }

    public onUpdate(dt: number) {
        super.onUpdate(dt);

        if (!this.isDead && !this.isLoading) {
            this._ai.onUpdate(dt);
        }
    }
}