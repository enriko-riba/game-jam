import { Global } from '..';
import { eventEmitter, createParticleEmitter } from '../global';
import { StatType, IStatChangeEvent } from './PlayerStats';
import * as particles from "pixi-particles";

import * as TWEEN from "@tweenjs/tween.js";

export class StatsHud extends PIXI.Container {
    private txtHP: PIXI.Text;
    private txtDust: PIXI.Text;
    private txtCoins: PIXI.Text;
    private txtExp: PIXI.Text;
    private txtLevel: PIXI.Text;
    private expPreFiller: PIXI.Sprite;
    private expFiller: PIXI.Sprite;
    private fillLen: number;

    private emitter:particles.Emitter;

    constructor() {
        super();
        this.setup();
    }

    public onUpdate(dt: number) {
        this.emitter.update(dt*0.001);
    }

    /**
     * Starts an animation tween with informational text moving upwards from the given position.
     * @param position the start position of the message
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    public addInfoMessage(position: PIXI.PointLike | {x: number, y: number}, message: string, style?: PIXI.TextStyleOptions, offsetX?: number): void {
        var stl = style || Global.TEXT_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        offsetX = offsetX || 0;
        txtInfo.position.set((Global.SCENE_WIDTH / 2) + offsetX, Global.SCENE_HEIGHT - position.y - 70);
        txtInfo.scale.set(1, 1);

        this.addChild(txtInfo);

        var dy = (position.y > Global.SCENE_HEIGHT / 2) ? 250 : -250;
        var upY = Global.SCENE_HEIGHT - position.y + dy;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();

        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: 1.6 }, 2200)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(() => this.removeChild(txtInfo));
        scale.chain(fade).start();
    }

    private setup() {
        //  HP
        {
            let y: number = 5;

            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/gui/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtHP = new PIXI.Text("0", Global.TEXT_STYLE);
            this.txtHP.resolution = window.devicePixelRatio;
            this.txtHP.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtHP);

            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/gui/heart.png"].texture);
            spr.position.set(21, y + 17);
            spr.scale.set(0.5);
            this.addChild(spr);
        }

        //  pixi dust
        {
            let y = 75;
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/gui/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtDust = new PIXI.Text("0", Global.TEXT_STYLE);
            this.txtDust.resolution = window.devicePixelRatio;
            this.txtDust.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtDust);  

            this.emitter = createParticleEmitter(pnl, [PIXI.Texture.fromImage("assets/star.png")]);
            this.emitter.updateOwnerPos(65, 90);
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
        }

        //  coins
        {
            let y = 145;

            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/gui/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtCoins = new PIXI.Text("0", Global.TEXT_STYLE);
            this.txtCoins.resolution = window.devicePixelRatio;
            this.txtCoins.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtCoins);

            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/gui/coin.png"].texture);
            spr.position.set(21, y + 17);
            spr.scale.set(0.5);
            this.addChild(spr);
        }

        //  Exp
        {
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/gui/exp_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(0, Global.SCENE_HEIGHT - pnl.height);
            this.addChild(pnl);

            //  pre filler rect
            this.expPreFiller = new PIXI.Sprite(PIXI.loader.resources["assets/gui/exp_prefill.png"].texture);
            this.expPreFiller.position.set(3, 3);
            pnl.addChild(this.expPreFiller);

            //  filler rect
            this.expFiller = new PIXI.Sprite(PIXI.loader.resources["assets/gui/exp_fill.png"].texture);
            this.expFiller.position.set(3, 3);
            pnl.addChild(this.expFiller);
            this.fillLen = pnl.width - 6; // 3 pixels for left/right border;


            this.txtExp = new PIXI.Text("0 / 1000", Global.EXP_BAR_STYLE);
            this.txtExp.pivot.set(0.5);
            this.txtExp.anchor.set(0.5);
            this.txtExp.resolution = window.devicePixelRatio;
            this.txtExp.position = new PIXI.Point(pnl.width / 2, pnl.height / 2);
            pnl.addChild(this.txtExp);

            //  character level
            this.txtLevel = new PIXI.Text(`Level ${Global.stats.characterLevel}`, Global.TEXT_STYLE);
            this.txtLevel.resolution = window.devicePixelRatio;
            this.txtLevel.anchor.set(0, 0.2);
            this.txtLevel.position.set(pnl.x + pnl.width + 4, pnl.y);
            this.addChild(this.txtLevel);
        }
        eventEmitter.on(Global.STATCHANGE_TOPIC, this.handleStatChange);
    }
    
    private handleStatChange = (event:IStatChangeEvent) => {
        switch (event.Type) {
            case StatType.Coins:
                this.txtCoins.text = event.NewValue.toString();
                break;
            case StatType.Dust:
                this.txtDust.text = `${event.NewValue.toFixed(0)} / ${event.Stats[StatType.MaxDust].toFixed(0)}`;
                break;
            case StatType.MaxDust:
                this.txtDust.text = `${Math.floor(event.Stats[StatType.Dust])} / ${event.NewValue.toFixed(0)}`;
                break;
            case StatType.HP:
                this.txtHP.text = `${Math.round(event.NewValue)} / ${event.Stats[StatType.MaxHP]}`;
                break;
            case StatType.MaxHP:
                this.txtHP.text = `${Math.round(event.Stats[StatType.HP])} / ${event.NewValue}`;
                break;
            case StatType.TotalExp:
            let exp = event.NewValue - event.OldValue;
                this.addInfoMessage({x: 0, y: 90}, `+${exp} exp`, null, -50);
                this.renderExp(event);
                break;
            // case StatType.CharacterLevel:
            //     this.handleLevelUp(event);
            //     break;

            // case StatType.AttributePoints:
            //     this.characterMngr.visible = event.NewValue > 0;
            //     this.txtAtrPts.visible = event.NewValue > 0;
            //     //this.txtAtrPts.text = "points available";
            //     break;
        }
    }
    
    private renderExp(event: IStatChangeEvent) {
        this.txtExp.text = `${Math.round(event.Stats[StatType.LevelExp])} / ${event.Stats[StatType.LevelMaxExp]}`;
        this.txtLevel.text = `Level ${Global.stats.characterLevel}`;

        var pct = Math.min(event.Stats[StatType.LevelExp] / event.Stats[StatType.LevelMaxExp], 1.0);

        //  special case during level up
        if (pct === 0) {
            this.expFiller.width = 1;
            this.expPreFiller.position.x = 1 + this.expFiller.x;
            return;
        }

        this.expPreFiller.position.x = this.expFiller.width + this.expFiller.x;
        var targetWidth = (this.fillLen * pct) | 0;

        var diff = targetWidth - this.expFiller.width;

        //  tween pre-fill width
        this.expPreFiller.width = 1;
        var preFillTween = new TWEEN.Tween(this.expPreFiller)
            .to({ width: diff }, 1500)
            .easing(TWEEN.Easing.Linear.None);

        var fillTween = new TWEEN.Tween(this.expFiller)
            .to({ width: targetWidth }, 2000)
            .easing(TWEEN.Easing.Bounce.Out);
        preFillTween.chain(fillTween).start();
    }
}