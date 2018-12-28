import * as Global from "../global";
import * as p2 from "p2";
import { Parallax, AnimatedSprite, AnimationSequence  } from "../_engine";
import { WorldP2 } from "./WorldP2";
import { Lava } from "./Lava";
import { Platform } from "./Platform";
import { SpawnPoint } from '../mobs/SpawnPoint';
import { Mob } from '../mobs/Mob';

// import { Bumper } from "../Bumper";
// import { Quest } from "./QuestSystem/Quest";

/**
 * Used with PIXI.DisplayObject
 */
export interface IInteractionType {
    interactionType?: number;
    drop?: IDrop;
}

export class LevelLoader {

    private gameLevels: IRootObject;

    constructor(gameLevels: IRootObject) {
        this.gameLevels = gameLevels;
    }

    /**
     * Returns all assets referenced in the level.
     * @param root
     * @param levelId
     */
    public static GetLevelAssets(root: IRootObject, levelId: number): string[] {
        var assets: string[] = [];

        var level: ILevelDefinition = undefined;
        for (var i = 0; i < root.levels.length; i++) {
            if (root.levels[i].id === levelId) {
                level = root.levels[i];
                break;
            }
        }

        if (level) {
            level.parallax.forEach((iplx) => {
                assets = assets.concat(iplx.textures);
            });

            if (level.assets && level.assets.length > 0) {
                assets = assets.concat(level.assets);
            }

            //  merge global templates with level templates
            var templates = root.templates.concat(level.map.templates);

            // add all textures from templates (we don't need to have entities referencing the template if they are in a spawn)
            level.map.templates.forEach((tos) => {
                if (!tos.type || tos.type !== "spawn_point") {
                    let templ = tos as ITemplate;
                    let dispObj = templ.displayObject;
                    if (dispObj.texture) {
                        if (typeof dispObj.texture === "string") {
                            assets.push(dispObj.texture);
                        } else {
                            assets = assets.concat(dispObj.texture);
                        }
                    }
                    if (dispObj.sequences) {
                        dispObj.sequences.forEach((item) => {
                            assets.push(item.texture);
                        });
                    }     
                }
            });

            level.map.entities.forEach((entity: IMapEntity) => {
                let defs = LevelLoader.getTemplates(templates, entity);
                if (defs.doDef.texture) {
                    if (typeof defs.doDef.texture === "string") {
                        assets.push(defs.doDef.texture);
                    } else {
                        assets = assets.concat(defs.doDef.texture);
                    }
                }
                if (defs.doDef.sequences) {
                    defs.doDef.sequences.forEach((item) => {
                        assets.push(item.texture);
                    });
                }                
            });

            level.map.NPC = level.map.NPC || [];
            level.map.NPC.forEach((tos:IMobEntity) => {
                //  check if its a template or spawn_point
                if (tos.type && tos.type==="spawn_point"){

                } else {
                    //  this is an entity definition
                    let entity: IMobEntity = tos as IMobEntity;

                    //  concat attack (string | string[])
                    if (entity.attack) {
                        assets = assets.concat(entity.attack);
                    }

                    var entityTemplate = templates.filter((item) => item.name === entity.template);
                    if (entityTemplate && entityTemplate.length > 0) {
                        var template = entityTemplate[0];
                        // var temp = $.extend(true, {}, template.displayObject);
                        // var displayObjectDefinition = $.extend(temp, entity);
                        var displayObjectDefinition = {...template.displayObject, ...entity};
                        if (displayObjectDefinition.texture) {
                            if (typeof displayObjectDefinition.texture === "string") {
                                assets.push(displayObjectDefinition.texture);
                            } else {
                                assets = assets.concat(displayObjectDefinition.texture);
                            }
                        }

                        if (displayObjectDefinition.attack) {
                            assets = assets.concat(displayObjectDefinition.attack);
                        }
                         
                        if (displayObjectDefinition.sequences) {
                            displayObjectDefinition.sequences.forEach((item) => {
                                //  add only if texture exists
                                if (item.texture) {
                                    assets.push(item.texture);
                                }
                            });
                        }
                    }
                }               
            });
        }

        assets = LevelLoader.getUniqueItems(assets);
        return assets;
    }

    /**
     * Returns a filtered array with unique only items from the input array
     * @param arr 
     */
    private static getUniqueItems(arr) {
        var n = {}, r = [];
        for (var i = 0; i < arr.length; i++) {
            if (!n[arr[i]]) {
                n[arr[i]] = true;
                r.push(arr[i]);
            }
        }
        return r;
    }

    /**
     * Loads the level.
     * @param name
     * @param container
     */
    public buildLevel(id: number): ILevel {

        //  find the level by its id
        var levelDefinition: ILevelDefinition = undefined;
        for (var i = 0; i < this.gameLevels.levels.length; i++) {
            if (this.gameLevels.levels[i].id === id) {
                levelDefinition = this.gameLevels.levels[i];
                break;
            }
        }

        //  create level objects
        var result: ILevel;
        if (levelDefinition) {
            result = this.createLevel(levelDefinition);
        }
        return result;
    }

    private createLevel(level: ILevelDefinition): ILevel {
        var result: ILevel = {
            parallax: [],
            entities: [],
            start: [],
            audioTrack: level.audioTrack,
            templates: [],
            spawnPoints: []
        };

        //--------------------------------------
        //  create parallax objects
        //--------------------------------------            
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
        level.parallax.forEach((iplx) => {
            var parallax = new Parallax(vps, iplx.parallaxFactor, iplx.scale);
            parallax.y = iplx.y;
            parallax.setTextures(iplx.textures);
            result.parallax.push(parallax);
        });

        //--------------------------------------
        //  merge global with level templates
        //--------------------------------------
        var templates = Global.GameLevels.templates.concat(level.map.templates);
        result.templates = templates;

        //--------------------------------------
        //  create display/physics object pairs
        //--------------------------------------
        level.map.entities.forEach((entity: IMapEntity, idx, arr) => {
            let p2body = LevelLoader.createEntity(templates, entity);            
            result.entities.push(p2body);
        });

        //--------------------------------------
        //  create NPC's
        //--------------------------------------
        level.map.NPC = level.map.NPC || [];
        level.map.NPC.forEach((npc: IMobEntity, idx, arr) => {
            if (npc.type && npc.type === "spawn_point") {
                let sp = <any>npc as ISpawnPoint;
                let entity = sp.entity;
                result.spawnPoints.push(new SpawnPoint(sp.name, sp.xy[0], sp.xy[1], sp.area, sp.maxMobCount, sp.respawnSeconds, entity));
            } else {
                let p2body = LevelLoader.createMob(templates, npc);                
                result.entities.push(p2body);
            }
        });
        result.start = level.map.start;
        return result;
    }

    public static createEntity(templates: Array<any>, entity: IMapEntity): p2.Body {
        let defs = LevelLoader.getTemplates(templates, entity);

        //  display object
        let dispObj: PIXI.DisplayObject = LevelLoader.buildDisplayObject(defs.doDef);
        dispObj.name = entity.name;
        (dispObj as any).templateName = defs.templateName;

        //  body
        var p2body: p2.Body;
        if (defs.bdDef) {
            p2body = LevelLoader.buildPhysicsObject(defs.bdDef, dispObj);
            p2body.shapes.every((s: p2.Shape) => {
                if (defs.bdDef.collisionType === "ground") {
                    s.collisionGroup = WorldP2.COL_GRP_GROUND;
                    s.collisionMask = WorldP2.COL_GRP_PLAYER | WorldP2.COL_GRP_NPC | WorldP2.COL_GRP_SCENE | WorldP2.COL_GRP_BULLET;
                } else {
                    s.collisionGroup = WorldP2.COL_GRP_SCENE;
                    s.collisionMask = WorldP2.COL_GRP_PLAYER | WorldP2.COL_GRP_NPC | WorldP2.COL_GRP_SCENE | WorldP2.COL_GRP_GROUND;
                }
                return true;
            });
            (p2body as any).DisplayObject = dispObj;

            //  trigger
            if (defs.trigger) {
                (p2body as any).Trigger = defs.trigger;
            }
        } else {
            p2body = new p2.Body();
            (p2body as any).DisplayObject = dispObj;
        }
        return p2body;
    }

    public static createMob(templates: Array<any>, entity: IMobEntity): p2.Body {
        let defs = LevelLoader.getTemplates(templates, entity);

        //  display object
        let mobDispObj: Mob = LevelLoader.buildDisplayObject(defs.doDef) as Mob;
        mobDispObj.name = entity.name;
        (mobDispObj as any).templateName = defs.templateName;

        // attributes and AI
        mobDispObj.attributes = entity.attributes || defs.doDef.attributes || [];
        mobDispObj.createAI(entity.ai || "basic_static");
        mobDispObj.atkTexture = entity.attack || defs.doDef.attack;

        //  body        
        defs.bdDef.material = defs.bdDef.material || "mob_default";
        var p2body: p2.Body = LevelLoader.buildPhysicsObject(defs.bdDef, mobDispObj);
        p2body.shapes.every((s: p2.Shape) => {
            s.collisionGroup = WorldP2.COL_GRP_NPC;
            s.collisionMask = WorldP2.COL_GRP_PLAYER | WorldP2.COL_GRP_GROUND | WorldP2.COL_GRP_SCENE;
            return true;
        });
        (p2body as any).DisplayObject = mobDispObj;

        //  trigger
        if (defs.trigger) {
            (p2body as any).Trigger = defs.trigger;
        }

        return p2body;
    }

   /**
    * Returns an object containing extracted display object and body definitions.
    * @param templates
    * @param entity
    */
    private static getTemplates(templates: Array<any>, entity: IMapEntity | IMobEntity) {
        let displayObjectDefinition = null;
        let bodyDefinition = null;
        let template = {
            name: null,
            displayObject: { typeName: "Sprite"}, //    sprite is the default if no template exists
            body: null,
            trigger: null,
            drop: null
        };
        var entityTemplate = templates.filter((item, idx, arr) => item.name === entity.template);
        if (entityTemplate && entityTemplate.length > 0) {
            template = entityTemplate[0];
        }
        // var temp = $.extend(true, {}, template.displayObject);        
        // displayObjectDefinition = $.extend(temp, entity);
        displayObjectDefinition = {...template.displayObject, ...entity};
        
        if (template.drop) {
            // temp = $.extend(true, {}, template.drop); 
            // displayObjectDefinition.drop = $.extend(true, temp, displayObjectDefinition.drop);
            displayObjectDefinition = {...displayObjectDefinition, drop: template.drop}
        }
        if (template.body) {
            //bodyDefinition = {...template.body, body: entity.body};
            bodyDefinition = template.body;
        }

        let triggerTemplate = undefined;
        if (template.trigger || displayObjectDefinition.trigger) {
            // triggerTemplate = $.extend(true, {}, template.trigger);
            // triggerTemplate = $.extend(true, triggerTemplate, displayObjectDefinition.trigger)
            triggerTemplate = {...template.trigger, ...displayObjectDefinition.trigger};
        }
        return {
            templateName: template.name,
            doDef: displayObjectDefinition,
            bdDef: bodyDefinition,
            trigger: triggerTemplate
        };        
    }

    /**
     * Creates a display object from the definition.
     * @param definition
     */
    private static buildDisplayObject(definition: IDisplayObjectDefinition): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject;
        switch (definition.typeName) {
            case "Mob":
                let mob = new Mob(definition.texture as string);
                //  if animations are defined in the json replace the built-in mob animations
                if (definition.sequences) {
                    mob.clearAnimations();
                    definition.sequences.forEach((seq) => {
                        var textureName = seq.texture || definition.texture;
                        var aseq = new AnimationSequence(seq.name, textureName as string, seq.frames, seq.framesize[0], seq.framesize[1]);
                        mob.addAnimations(aseq);
                    });
                    mob.play(definition.sequences[0].name);
                }
                if (definition.fps) {
                    mob.fps = definition.fps;
                }
                mob.anchor.set(0.5, 0.5);
                (mob as any).typeName = "Mob";
                dispObj = mob;
                break;

            case "Sensor":
                dispObj = new PIXI.DisplayObject();
                (dispObj as any).typeName = "Sensor";
                break;

            case "AnimatedSprite":
                var aspr = new AnimatedSprite();
                definition.sequences.forEach((seq, idx, arr) => {
                    var aseq = new AnimationSequence(seq.name, seq.texture, seq.frames, seq.framesize[0], seq.framesize[1]);
                    aspr.addAnimations(aseq);
                });
                aspr.play(definition.sequences[0].name, definition.fps);
                aspr.anchor.set(0.5, 0.5);
                (aspr as any).typeName = "AnimatedSprite";
                dispObj = aspr;
                break;

            case "Sprite":
                var text = PIXI.loader.resources[definition.texture as string].texture;
                var spr = new PIXI.Sprite(text);

                if (definition.anchor === undefined)
                    definition.anchor = 0.5;
                spr.anchor.set(definition.anchor);

                if (definition.pivot === undefined)
                    definition.pivot = 0.5;

                if (definition.scale === undefined)
                    definition.scale = [1, -1];

                spr.pivot.set(definition.pivot);
                (spr as any).typeName = "Sprite";
                dispObj = spr;
                break;

            // case "Balloon":
            //     var bln = new Balloon();
            //     dispObj = bln;
            //     break;

            // case "Bumper":
            //     var bmp = new Bumper();
            //     bmp.anchor.set(0.5);
            //     dispObj = bmp;
            //     break;

            case "Lava":
                var lv = new Lava(definition.texture as string);
                dispObj = lv;
                break;

            case "Platform":
                let pl: Platform = null;
                if (typeof definition.texture === "string") {
                    pl = new Platform(definition.tilesX || 1, 1, [definition.texture]);
                } else {
                    pl = new Platform(definition.tilesX || 1, definition.tilesY || 1, definition.texture);
                }
                dispObj = pl;
        }

        if (definition.visible !== undefined) {
            dispObj.visible = definition.visible;
        }
        dispObj.rotation = definition.rotation || 0;
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
        }
        if (definition.scale) {
            dispObj.scale.set(definition.scale[0], definition.scale[1]);
        }
        if (definition.interactionType) {
            (dispObj as IInteractionType).interactionType = definition.interactionType;
        }
        if (definition.drop) {
            (dispObj as IInteractionType).drop = definition.drop;
        }
        if (definition.tint) {
            (dispObj as any).tint = parseInt(definition.tint, 16);
        }
        return dispObj;
    }

    /**
     * Creates a physics body and shape from the definition.
     * @param definition
     * @param dispObj the display object to retrieve the defaults from.
     * @param preventSensor if true a non sensor body will be created (this is to support mobs
     *                      that must have normal bodies but also an interactionType.
     */
    private static buildPhysicsObject(definition: IBodyDefinition, dispObj: PIXI.DisplayObject, preventSensor: boolean = false): p2.Body {
        var body: p2.Body;
        let w = 0, h = 0;
        if (definition) {
            var options: p2.BodyOptions = {
                mass: definition.mass,
                position: definition.xy ? definition.xy : [dispObj.x, dispObj.y],
                angle: definition.angle || dispObj.rotation,
                fixedRotation: definition.fixedRotation || false,
                angularDamping: definition.angularDamping || 0.1,
                damping: definition.damping || 0.1,
            } as p2.BodyOptions;
            
            body = new p2.Body(options);
            body.type = definition.type || p2.Body.KINEMATIC; /* DYNAMIC = 1, DYNAMIC = 1, STATIC = 2 */
            var dispObjAsAny: any = dispObj as any;
            var shape: p2.Shape;
            switch (definition.shape) {
                case "Circle":
                    let radius = 32;
                    if (definition.size) {
                        if (definition.size.constructor === Array) {
                            radius = definition.size[0];
                        } else {
                            radius = definition.size as number;
                        }
                    } else {
                        radius = dispObjAsAny.width;
                    }
                    shape = new p2.Circle({ radius: radius });
                    break;

                case "Platform":
                    if (definition.size) {
                        w = definition.size[0];
                        h = definition.size[1];
                    } else {
                        w = Math.abs(dispObjAsAny.width);
                        h = Math.abs(dispObjAsAny.height);
                    }
                    shape = new p2.Box({
                        width: w,
                        height: h,
                    });

                    //  the position is centered but we need it to be left top aligned
                    body.position[0] = body.position[0] + w / 2;
                    body.position[1] = body.position[1] - h / 2;
                    break;

                case "Box":
                    //  get the size
                    if (definition.size) {
                        w = definition.size[0];
                        h = definition.size[1];
                    } else {
                        if (dispObjAsAny.width) {
                            w = Math.abs(dispObjAsAny.width);
                            h = Math.abs(dispObjAsAny.height);
                        } else {
                            //  TODO: check this - seems not to get correct bounds
                            w = dispObj.scale.x * dispObj.getLocalBounds().width;
                            h = dispObj.scale.y * dispObj.getLocalBounds().height;
                        }
                    }
                    shape = new p2.Box({
                        width: w,
                        height: h,
                    });
                    break;
                //  TODO: implement other shapes if needed
            }

            if (definition.material) {
                (shape as any).materialName = definition.material;
            }

            if (!preventSensor && !!(dispObj as IInteractionType).interactionType) {
                shape.sensor = true;
                body.type = p2.Body.STATIC;
                body.collisionResponse = false;
                body.setDensity(0.0); //   this is to prevent body impacts on player collide (makes no sense as it is a sensor, bug maybe?)
                console.log("created collectible sensor", shape);
            } else if ((dispObj as any).typeName === "Sensor") {
                shape.sensor = true;
                body.type = p2.Body.STATIC;
                body.collisionResponse = false;
                body.setDensity(0.0);
            }

            body.addShape(shape);
        }
        return body;
    }
}

export interface ILevel {
    parallax: Parallax[];
    entities: p2.Body[];
    start: number[];
    audioTrack?: number;
    spawnPoints?: SpawnPoint[];

    /**
     * Calculated array that is a union of global templates
     * and current level templates. It is set inside the createLevel()
     */
    templates: ITemplate[];
}

export interface IParallaxDefinition {
    name: string;
    parallaxFactor: number;
    y: number;
    textures: string[];
    scale?: number;
}

export interface IBodyDefinition {
    shape: string;
    type: number; /* DYNAMIC = 1, DYNAMIC = 1, STATIC = 2 */
    xy: number[];
    size?: number[] | number;
    mass: number;
    angle: number;
    material?: string;
    damping?: number;
    angularDamping?: number;
    fixedRotation?: boolean;
}

export interface IAnimationSequence {
    name: string;
    texture: string;
    frames: number[];
    framesize: number[];
}

export interface IDisplayObjectDefinition {
    typeName: string;
    texture: string | string[];
    tilesX?: number;
    tilesY?: number;
    xy?: number[];
    scale?: number[];
    rotation?: number;
    pivot?: number;
    anchor?: number;
    interactionType?: number;
    tint?: string;
    visible?: boolean;
    fps?: number;
    sequences?: IAnimationSequence[];
    drop?: IDrop;
}

export interface ITriggerDefinition {
    type: string;
    distance?: number;
    questId?: number;
    state?: number;
    dependsOn?: Array<number>;
    desc?: string;

    /*
     * Created during run time to prevent trigger actions each frame
     */
    lastActive?: number;
}

export interface IDrop {
    chance: number;
    entity: IMapEntity;
}

export interface ITemplate {
    name: string;
    displayObject: IDisplayObjectDefinition;
    body?: IBodyDefinition;
    trigger?: ITriggerDefinition;
    drop?: IDrop;
    type?: string;  //    used only for typing system as instead of a template a spawn point can appear
}

export interface IMapEntity {
    template: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;
    texture?: string;
    interactionType?: number;
    name?: string;
    collisionType?: string;
}

export interface ISpawnPoint {
    name: string;
    xy: number[];
    area: number;
    maxMobCount: number;
    respawnSeconds: number;
    isActive?: boolean;
    entity: IMobEntity;

}

export interface IMobEntity {
    template: string;
    xy?: number[];
    scale?: number[];    
    texture?: string;
    interactionType?: number;
    name?: string;
    attributes: number[];
    ai: string;
    attack: string | string[];
    drop?: IDrop;
    type?: string;
}

export interface ILevelMap {
    start: number[];
    templates: ITemplate[];
    entities: IMapEntity[];
    NPC: IMobEntity[];
}

export interface ILevelDefinition {
    id: number;
    assets?: string[];
    name: string;
    parallax: IParallaxDefinition[];
    audioTrack?: number;
    map: ILevelMap;
}

export interface IRootObject {
    templates: ITemplate[];
    levels: ILevelDefinition[];
   // quests: Quest[];
}