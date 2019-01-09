import * as particles from "pixi-particles";
import * as TWEEN from "@tweenjs/tween.js";
import { Global, TextureLoader } from '..';
import { createParticleEmitter } from '../global';
import { stats } from './PlayerStats';
import { eventEmitter, STATCHANGE_TOPIC, DAMAGE_TOPIC, IStatChangeEvent, IDpsChangeEvent } from '../events';
import { SCENE_HALF_WIDTH, SCENE_HEIGHT, SCENE_HALF_HEIGHT, MSG_HP_STYLE, QUEST_ITEM_STYLE, SCENE_WIDTH, QUEST_STYLE, GUI_FONT, MSG_EXP_STYLE } from '../constants';
import { StatType } from '../enums';

export class StatsHud extends PIXI.Container {
    private txtHP: PIXI.extras.BitmapText;
    private txtDust: PIXI.extras.BitmapText;
    private txtCoins: PIXI.extras.BitmapText;
    private txtExp: PIXI.extras.BitmapText;
    private txtLevel: PIXI.extras.BitmapText;
    private expPreFiller: PIXI.Sprite;
    private expFiller: PIXI.Sprite;
    private fillLen: number;

    private emitter: particles.Emitter;

    private statContainer: PIXI.Sprite;
    
    private questPanel: PIXI.Sprite;
    private txtQuestMessage: PIXI.extras.BitmapText;

    private questMsgEndTime = 0;
    private onCompleteCB?: () => void;

    private txtPlayerPosition: PIXI.extras.BitmapText;

    constructor() {
        super();
        this.setup();
    }

    private setup() {
        //  TODO: remove or make a hud for player position
        this.txtPlayerPosition = new PIXI.extras.BitmapText("", QUEST_STYLE);
        this.txtPlayerPosition.position = new PIXI.Point(SCENE_WIDTH, SCENE_HEIGHT);
        (this.txtPlayerPosition.anchor as any).set(1, 1);
        this.addChild(this.txtPlayerPosition);

        
        //  top left stat container panel
        this.statContainer = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@panel_stats.png", true));
        this.statContainer.position.set(4);
        this.statContainer.name = "TriggerMessage";
        this.statContainer.anchor.set(0);
        this.addChild(this.statContainer);
        
        this.questPanel = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@panel.png"));
        this.questPanel.anchor.set(0);
        this.questPanel.position.set(4, 88);
        this.addChild(this.questPanel);

        this.txtQuestMessage = new PIXI.extras.BitmapText("", QUEST_STYLE);
        this.txtQuestMessage.position.set(14);
        (this.txtQuestMessage.anchor as any).set(0);
        this.questPanel.addChild(this.txtQuestMessage);

        let txtPanelStyle: PIXI.extras.BitmapTextStyle = {font:'26px Orbitron', tint: 0xfeff00};
        let y: number = this.statContainer.height/2;
        //  HP
        {
            this.txtHP = new PIXI.extras.BitmapText("0", txtPanelStyle);
            (this.txtHP.anchor as any).set(0, 0.5);
            this.txtHP.position = new PIXI.Point(84, this.statContainer.height/2);
            this.statContainer.addChild(this.txtHP);

            let spr = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@heart.png"));
            spr.anchor.set(0.5);
            spr.position.set(45, this.statContainer.height/2);
            this.statContainer.addChild(spr);
        }

        //  pixi dust
        {
            this.txtDust = new PIXI.extras.BitmapText("0", txtPanelStyle);            
            (this.txtDust.anchor as any).set(0, 0.5);
            this.txtDust.position = new PIXI.Point(334, this.statContainer.height/2);
            this.statContainer.addChild(this.txtDust);

            this.emitter = createParticleEmitter(this.statContainer, [TextureLoader.Get("assets/objects-atlas.json@star.png")]);
            this.emitter.updateOwnerPos(292, 64);
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
        }

        //  coins
        {
            this.txtCoins = new PIXI.extras.BitmapText("0", txtPanelStyle);
            (this.txtCoins.anchor as any).set(0, 0.5);
            this.txtCoins.position = new PIXI.Point(586, this.statContainer.height/2);
            this.statContainer.addChild(this.txtCoins);

            let spr = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@coin.png"));
            spr.anchor.set(0.5);
            spr.position.set(544, this.statContainer.height/2);
            this.statContainer.addChild(spr);
        }

        //  Exp
        {
            let pnl = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@exp_panel.png"));
            
            pnl.position.set(0, SCENE_HEIGHT - pnl.height);
            this.addChild(pnl);

            //  pre filler rect
            this.expPreFiller = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@exp_prefill.png"));
            this.expPreFiller.position.set(3, 3);
            pnl.addChild(this.expPreFiller);

            //  filler rect
            this.expFiller = new PIXI.Sprite(TextureLoader.Get("assets/gui-atlas.json@exp_fill.png"));
            this.expFiller.position.set(3, 3);
            pnl.addChild(this.expFiller);
            this.fillLen = pnl.width - 6; // 3 pixels for left/right border;

            let txtExpStyle = {font:'18px Bauhaus'}
            this.txtExp = new PIXI.extras.BitmapText("0 / 1000", txtExpStyle);
            this.txtExp.pivot.set(0.5);
            (this.txtExp.anchor as any).set(0.5);
            this.txtExp.position = new PIXI.Point(pnl.width / 2, pnl.height / 2);
            this.txtExp.tint = 0xfeff44;
            pnl.addChild(this.txtExp);

            //  character level
            this.txtLevel = new PIXI.extras.BitmapText(`Level ${stats.characterLevel}`, txtExpStyle);
            this.txtLevel.position.set(pnl.x + pnl.width + 4, pnl.y);
            this.txtLevel.tint = 0xfeff44;
            this.addChild(this.txtLevel);
        }

        eventEmitter.on(STATCHANGE_TOPIC, this.handleStatChange);
        eventEmitter.on(DAMAGE_TOPIC, this.handleDpsChange);
    }

    public onUpdate(dt: number) {
        this.emitter.update(dt * 0.001);

        // if (this.txtQuestMessage.visible && this.questMsgEndTime < performance.now()) {
        //     this.txtQuestMessage.visible = false;
        //     if (this.onCompleteCB) {
        //         this.onCompleteCB();
        //     }
        // }

        if (this.questPanel.visible && this.questMsgEndTime < performance.now()) {
            this.questPanel.visible = false;
            if (this.onCompleteCB) {
                this.onCompleteCB();
            }
        }

        this.txtPlayerPosition.text = `${Global.position.x.toFixed(0)}, ${Global.position.y.toFixed(0)}`;
    }

    /**
     * Starts an animation tween with informational text moving upwards from the given position.
     * @param position the start position of the message
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    public addInfoMessage(position: PIXI.PointLike | { x: number, y: number }, message: string, style?: PIXI.extras.BitmapTextStyle, offsetX?: number): void {
        var stl = {...{font:'24px Orbitron', tint: 0xffffff}, ...style};
        var txtInfo = new PIXI.extras.BitmapText(message, stl);
        offsetX = offsetX || 0;
        txtInfo.position.set(SCENE_HALF_WIDTH + offsetX, SCENE_HEIGHT - position.y - 70);
        txtInfo.scale.set(1, 1);
        this.addChild(txtInfo);

        var dy = (position.y > SCENE_HALF_HEIGHT) ? 250 : -250;
        var upY = SCENE_HEIGHT - position.y + dy;
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

    /**
     * Adds text message about acquired quest items.
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    public addQuestItemMessage(message: string): void {
        var txtInfo = new PIXI.extras.BitmapText(message, QUEST_ITEM_STYLE);
        (txtInfo.anchor as any).set(0.5);
        txtInfo.position.set(SCENE_HALF_WIDTH, 150);
        this.addChild(txtInfo);
        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.8, y: 1.8 }, 2200)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(() => this.removeChild(txtInfo));
        scale.chain(fade).start();
    }

    /**
     * Displays the quest message in the quest rectangle.
     * @param msg
     * @param ttlMilis
     */
    public setQuestMessage(msg: string, ttlMilis: number = 8000, onCompleteCB: () => void = null) {
        this.txtQuestMessage.text = msg;
        this.questPanel.visible = true;
        //this.txtQuestMessage.visible = true;
        this.questMsgEndTime = performance.now() + ttlMilis;
        this.onCompleteCB = onCompleteCB;
    }

    /**
     * Starts an animation tween with level up message.
     * @param message the message to be added
     */
    private addLvlUpMessage(message: string): void {
        var stl: PIXI.TextStyleOptions = {
            align: "center",
            padding: 0,
            fontSize: "64px",
            fontFamily: GUI_FONT,
            fill: 0x335533,
            strokeThickness: 6,
            stroke: 0xccccff
        };

        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.scale.set(1);
        txtInfo.anchor.set(0.5);
        txtInfo.position.set(SCENE_HALF_WIDTH, SCENE_HEIGHT - Global.position.y - 70);
        this.addChild(txtInfo);

        var dy = (Global.position.y > SCENE_HALF_HEIGHT) ? 450 : -450;
        var upY = SCENE_HEIGHT - Global.position.y + dy;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();

        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: 1.6 }, 1500)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0.4 }, 6000)
            .onComplete(() => this.removeChild(txtInfo));
        scale.chain(fade).start();
    }    

    private handleDpsChange = (event: IDpsChangeEvent) => {
        this.addInfoMessage(Global.position, `${event.Amount} HP`, MSG_HP_STYLE, 50);
    };

    private handleStatChange = (event: IStatChangeEvent) => {
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
                if (exp != 0)
                    this.addInfoMessage({ x: 0, y: 90 }, `+${exp} exp`, MSG_EXP_STYLE, -50);
                this.renderExp(event);
                break;
            case StatType.CharacterLevel:
                this.handleLevelUp(event);
                break;

            // case StatType.AttributePoints:
            //     this.characterMngr.visible = event.NewValue > 0;
            //     this.txtAtrPts.visible = event.NewValue > 0;
            //     //this.txtAtrPts.text = "points available";
            //     break;
        }
    }

    private handleLevelUp = (event: IStatChangeEvent) => {
        this.txtExp.text = `${Math.round(event.Stats[StatType.LevelExp])} / ${event.Stats[StatType.LevelMaxExp]}`;
        this.expFiller.width = 1;
        this.addLvlUpMessage("Level " + event.NewValue);
        this.txtLevel.text = `Level ${stats.characterLevel}`;
    };

    private renderExp(event: IStatChangeEvent) {
        this.txtExp.text = `${Math.round(event.Stats[StatType.LevelExp])} / ${event.Stats[StatType.LevelMaxExp]}`;
        this.txtLevel.text = `Level ${stats.characterLevel}`;

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