import * as p2 from 'p2';
import * as TWEEN from "@tweenjs/tween.js";

import { PIXI, SceneManager, Global, Scene, Parallax } from "..";
import { HeroCharacter } from '../objects/HeroCharacter';
import { WorldP2 } from '../objects/WorldP2';
import { StatsHud } from '../objects/StatsHud';
import { LevelLoader, IInteractionType } from '../objects/LevelLoader';
import { DamageType, StatType, IDpsChangeEvent, IBurnChangeEvent } from '../objects/PlayerStats';
import { Bullet } from '../Objects/Bullet';
import { Mob, AtrType } from '../mobs/Mob';
import { eventEmitter, BURN_TOPIC, DAMAGE_TOPIC } from '../global';


export class MainScene extends Scene {
    private worldContainer: PIXI.Container;
    private parallax: Parallax[] = [];
    private hero: HeroCharacter;
    public wp2: WorldP2;

    private hud : StatsHud;

    constructor(scm: SceneManager) {
        super(scm, "Main");
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
        this.setup();
    }

    public onUpdate(dt: number) {

        //-------------------------------------------
        //  update world & world container position
        //-------------------------------------------        
        this.wp2.update(dt);
        this.worldContainer.x = (Global.SCENE_HALF_WIDTH - this.hero.x);
        this.worldContainer.y = (Global.SCENE_HEIGHT - 70);

        //-------------------------------------------
        //  update parallax
        //-------------------------------------------
        this.parallax.forEach(p => {
            p.SetViewPortX(this.hero.x);
            p.position.x = this.hero.x - Global.SCENE_HALF_WIDTH;
        });

        //-------------------------------------------
        //  update entities position
        //-------------------------------------------
        var bodies = this.wp2.bodies;
        for (var i = 0, len = bodies.length; i < len; i++) {
            let body = bodies[i] as any;
            let displayObject: PIXI.DisplayObject = (body as any).DisplayObject as PIXI.DisplayObject;
            if (displayObject && displayObject.visible && body.type !== p2.Body.STATIC) {
                displayObject.position.set(Math.floor(body.interpolatedPosition[0]), Math.floor(body.interpolatedPosition[1]));
                displayObject.rotation = body.interpolatedAngle;
            }
            
            /*
            if (body.Trigger && body.Trigger.type === "distance") {
                if (this.questMngr.canActivateTrigger(body.Trigger)) {
                    let x = this.hero.position.x - body.position[0];
                    let y = this.hero.position.y - body.position[1];
                    let distance = Math.sqrt(x * x + y * y);
                    if (body.Trigger.distance >= distance) {
                        this.questMngr.handleTriggerEvent(body);
                    }
                }
            }
            */
        }

        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        for (var i = 0, len = this.wp2.playerContacts.length; i < len; i++) {
            let body: any = this.wp2.playerContacts[i];
            if (body.DisplayObject && body.DisplayObject.interactionType) {
                this.handleInteractiveCollision(body);
            }

            /*
            if (body.Trigger && body.Trigger.type === "collision") {
                this.questMngr.handleTriggerEvent(body);
            }
            */
        }


        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        for (var i = 0, len = this.worldContainer.children.length; i < len; i++) {
            let child: any = this.worldContainer.children[i];
            if (child && child.onUpdate) {
                child.onUpdate(dt);
            }
        };

        this.hud.onUpdate(dt);
        Global.stats.onUpdate(dt);
    }

    private setup() {
        this.worldContainer = new PIXI.Container();
        this.worldContainer.scale.y = -1;
        this.addChild(this.worldContainer);

        //-----------------------------
        //  setup hero 
        //-----------------------------     
        this.hero = new HeroCharacter(this.worldContainer);
        this.hero.name = "hero";
        this.hero.x = Global.SCENE_HALF_WIDTH;

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2();
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);

        this.wp2.playerBody.position[0] = Global.SCENE_HALF_WIDTH;
        this.wp2.playerBody.position[1] = 10;

        this.hero.play("idle", Global.ANIMATION_FPS_SLOW);
        this.hud = new StatsHud();
        this.HudOverlay = this.hud;

        this.clearLevel();

        //--------------------------------------
        //  test level loading
        //  TODO: this should be via user save file
        //--------------------------------------
        var stats = Global.stats;
        stats.loadLevel();
        stats.currentLevel.parallax.forEach((plx, idx) => {
            this.parallax.push(plx);
            this.worldContainer.addChildAt(plx, idx);
        });
        //--------------------------------------
        //  add all objects from level to scene
        //--------------------------------------
        stats.currentLevel.entities.forEach((body: any) => {
            this.worldContainer.addChild(body.DisplayObject);

            //  if entity is a simple sprite it has a "fake" body  
            //  without any shapes, so no need to add it to world
            if (body.shapes && body.shapes.length > 0) {
                this.wp2.addBody(body);
            }
        });

        //  set start for player
        this.wp2.playerBody.position[0] = stats.currentLevel.start[0];
        this.wp2.playerBody.position[1] = stats.currentLevel.start[1];

        eventEmitter.on(BURN_TOPIC, this.handleBurnChange);
        eventEmitter.on(DAMAGE_TOPIC, this.handleDpsChange);
    }

    /**
     * Starts an animation tween and removes the display object from scene.
     * @param dispObj
     */
    private addCollectibleTween(dispObj: PIXI.DisplayObject): void {
        var orgScaleX = dispObj.scale.x;
        //var orgScaleY = dispObj.scale.y;
        var upX = dispObj.position.x + 45;
        var upY = dispObj.position.y + 160;

        var endX = dispObj.position.x - Global.SCENE_WIDTH / 2;
        var endY = Global.SCENE_HEIGHT;

        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 150);

        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.5, y: orgScaleX + 0.5 }, 500)
            .easing(TWEEN.Easing.Linear.None);

        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 2000)
            .easing(TWEEN.Easing.Back.In)
            .onComplete(() => this.worldContainer.removeChild(dispObj));

        moveUp.chain(scale, moveAway).start();
    }

    private handleDpsChange = (event: IDpsChangeEvent) => {
        this.hud.addInfoMessage(this.hero.position, `${event.Amount} HP`, Global.MSG_HP_STYLE, 50);
    };

    private handleBurnChange = (event: IBurnChangeEvent) => {
        if (event.isBurning) {
            //Global.snd.burn();
        } else {
            //Global.snd.burnStop();
        }
    }

    /**
     * Handles player collision with interactive objects.
     * @param body
     */
    private handleInteractiveCollision(body: any): void {
        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;


        switch ((dispObj as IInteractionType).interactionType) {
            case 1: //  small coin
                Global.stats.increaseStat(StatType.Coins, 1);
                this.addCollectibleTween(dispObj);
                this.hud.addInfoMessage(dispObj.position, "+1 coin", Global.MSG_COIN_STYLE, -100);
                this.removeEntity(body);
               // Global.snd.coin();
                break;

            case 2: //  coin
                Global.stats.increaseStat(StatType.Coins, 10);
                this.addCollectibleTween(dispObj);
                this.hud.addInfoMessage(dispObj.position, "+10 coins", Global.MSG_COIN_STYLE, -100);
                this.removeEntity(body);
               // Global.snd.coin();
                break;

            case 3: //  blue gem
                Global.stats.increaseStat(StatType.Coins, 100);
                this.addCollectibleTween(dispObj);
                this.hud.addInfoMessage(dispObj.position, "+100 coins", Global.MSG_COIN_STYLE, -100);
                this.removeEntity(body);
                //Global.snd.gem();
                break;

            //------------------------------------
            //  QUEST ITEMS 200-999
            //------------------------------------

            case 201:  //  kendo knowledge
                this.hud.addInfoMessage(dispObj.position, "Kendo knowledge acquired!", Global.MSG_COIN_STYLE);
                this.addCollectibleTween(dispObj);
                this.removeEntity(body);
                //Global.snd.questItem();
                //this.questMngr.acquireItem(201);
                break;

            case 202:  //  KI
                this.hud.addInfoMessage(dispObj.position, "1 Ki acquired!", Global.MSG_COIN_STYLE);
                this.addCollectibleTween(dispObj);
                this.removeEntity(body);
                //Global.snd.questItem();
                //this.questMngr.acquireItem(202);
                //  TODO: quest manager
                break;

            //------------------------------------
            //  OBJECTS DOING DAMAGE 1000-1999
            //------------------------------------

            case DamageType.LavaBorder:  //  border lava   
                {
                    let now = performance.now() / 1000;
                    if (!Global.stats.buffs[DamageType.LavaBorder] || Global.stats.buffs[DamageType.LavaBorder] < now) {
                        this.hud.addInfoMessage(dispObj.position, "Burning", Global.MSG_WARN_STYLE, 100);
                    }
                    Global.stats.buffs[DamageType.LavaBorder] = this.secondsFromNow(1);
                }
                break;
            case DamageType.Lava:  //  lava
                {
                    let now = performance.now() / 1000;
                    if (!Global.stats.buffs[DamageType.Lava] || Global.stats.buffs[DamageType.Lava] < now) {
                        this.hud.addInfoMessage(dispObj.position, "Burning", Global.MSG_WARN_STYLE, 100);
                    }
                    Global.stats.buffs[DamageType.Lava] = this.secondsFromNow(3);
                }
                break;

            default:
            //----------------------------------------------------------
            //  MOBS 2000 - 2999
            //  Note: mobs don't interact on collision because only 
            //  some contacts are important (jump etc). Therefore
            //  handleInteractiveCollision() is called manually and
            //  the callee must set the mob.ShouldInteract to exclude
            //  standard collision logic.
            //----------------------------------------------------------
            //if (dispObj.interactionType >= 2000 && dispObj.interactionType < 3000) {
            //    var mob: Mob = body.DisplayObject as Mob;
            //    if (mob.ShouldInteract) {
            //        this.handleMobInteraction(mob, dispObj.interactionType, body);
            //    }                    
            //}
        }
    }

    /**
     * Helper that returns time tick value with the given seconds added.
     * @param seconds
     */
    private secondsFromNow(seconds: number): number {
        var now = performance.now() / 1000;
        now += seconds;
        return now;
    };


    

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
            this.worldContainer.removeChild((body as any).DisplayObject);
        }
        (body as any).DisplayObject = null;
    }

    private bullets: Bullet[] = [];

    private clearLevel() {
        var stats = Global.stats;
        if (stats.currentLevel) {
            stats.currentLevel.parallax.forEach((plx: Parallax, idx: number) => {
                this.worldContainer.removeChild(plx);
            });
            stats.currentLevel.entities.forEach((body: any) => {
                if (body !== this.wp2.playerBody) {
                    this.worldContainer.removeChild(body.DisplayObject);
                    this.wp2.removeBody(body);
                    body.DisplayObject = null;
                }
            });

            //  now remove all other display objects except hero
            var all = this.worldContainer.children.filter((c: PIXI.DisplayObject) => c.name !== "hero");
            all.forEach((child: any) => {
                this.worldContainer.removeChild(child);
            });
            this.wp2.clearLevel();
            this.bullets = [];
        }
    }
}