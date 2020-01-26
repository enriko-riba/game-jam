import * as Global from "../global";
import * as p2 from "p2";
import { PIXI, Parallax, Dictionary, AnimatedSprite, AnimationSequence, TextureLoader} from "..";
import { COL_GRP_PLAYER, COL_GRP_GROUND, COL_GRP_NPC, COL_GRP_SCENE, COL_GRP_BULLET } from "./CollisionGroups";
import { SpawnPoint } from '../mobs/SpawnPoint';
import { Mob } from '../mobs/Mob';
import { IRootObject, ILevel, ILevelDefinition, IMapEntity, IMobEntity, ISpawnPoint, IDisplayObjectDefinition, IInteractionType, IBodyDefinition } from './LevelInterfaces';
import { getEntityDefinition } from './LevelHelper';
import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants';

declare type Fn = (definition: IDisplayObjectDefinition) => PIXI.DisplayObject;

export class LevelLoader {
    
    private gameLevels: IRootObject;
    private static factoryList = new Dictionary<Fn>();

    constructor(gameLevels: IRootObject) {
        this.gameLevels = gameLevels;
    }

    /**
     * Registers custom factory function for creating display objects.
     * @param name the entity name used in level definition
     * @param factory factory function returning a display object based on the given definition
     */
    public static registerFactory(name:string, factory:Fn){
        this.factoryList.set(name, factory);
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
        var vps = new PIXI.Point(SCENE_WIDTH, SCENE_HEIGHT);
        level.parallax.forEach((iplx) => {
            var parallax = new Parallax(vps, iplx.parallaxFactor, iplx.textures, iplx.scale);
            parallax.y = iplx.y;
            result.parallax.push(parallax);
        });

        //--------------------------------------
        //  merge global with level templates
        //--------------------------------------
        var templates = Global.LevelDefinitions.templates.concat(level.map.templates);
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
        let defs = getEntityDefinition(templates, entity);

        //  display object
        let dispObj: PIXI.DisplayObject = LevelLoader.buildDisplayObject(defs.doDef);
        dispObj.name = entity.name || entity.template;
        (dispObj as any).templateName = defs.templateName;

        //  body
        var p2body: p2.Body;
        if (defs.bdDef) {
            p2body = LevelLoader.buildPhysicsObject(defs.bdDef, dispObj);
            p2body.shapes.every((s: p2.Shape) => {
                if (defs.bdDef.collisionType === "ground") {
                    s.collisionGroup = COL_GRP_GROUND;
                    s.collisionMask = COL_GRP_PLAYER | COL_GRP_NPC | COL_GRP_SCENE | COL_GRP_BULLET;
                } else {
                    s.collisionGroup = COL_GRP_SCENE;
                    s.collisionMask = COL_GRP_PLAYER | COL_GRP_NPC | COL_GRP_SCENE | COL_GRP_GROUND;
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
        let defs = getEntityDefinition(templates, entity);

        //  display object
        let mobDispObj: Mob = LevelLoader.buildDisplayObject(defs.doDef) as Mob;
        mobDispObj.name = entity.name || entity.template;
        (mobDispObj as any).templateName = defs.templateName;

        // attributes and AI
        mobDispObj.attributes = entity.attributes || defs.doDef.attributes || [];
        mobDispObj.createAI(entity.ai || "basic_static");
        mobDispObj.atkTexture = entity.attack || defs.doDef.attack;

        //  body        
        defs.bdDef.material = defs.bdDef.material || "mob_default";
        var p2body: p2.Body = LevelLoader.buildPhysicsObject(defs.bdDef, mobDispObj);
        p2body.shapes.every((s: p2.Shape) => {
            s.collisionGroup = COL_GRP_NPC;
            s.collisionMask = COL_GRP_PLAYER | COL_GRP_GROUND | COL_GRP_SCENE;
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
     * Creates a display object from the definition.
     * @param definition
     */
    private static buildDisplayObject(definition: IDisplayObjectDefinition): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject;
        definition = {...{anchor: 0.5, pivot: 0.5, scale:[1,1]}, ...definition};
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
                (aspr as any).typeName = "AnimatedSprite";
                dispObj = aspr;
                break;

            case "Sprite":
                var sprTexture = TextureLoader.Get(definition.texture as string);
                var spr = new PIXI.Sprite(sprTexture);
                (spr as any).typeName = "Sprite";
                dispObj = spr;
                break;

            default:
                var factory = this.factoryList.get(definition.typeName);
                if(factory)
                    dispObj = factory(definition);
                else
                    throw "Factory not found for object name: " + definition.typeName;
                break;            
        }
        (dispObj).scale.set(definition.scale[0], definition.scale[1] * -1); //  the worldContainer has -y scale so we must flip it up again 
        if((dispObj as any).anchor)(dispObj as any).anchor.set(definition.anchor);
        dispObj.pivot.set(definition.pivot);

        if (definition.visible !== undefined) {
            dispObj.visible = definition.visible;
        }
        dispObj.rotation = definition.rotation || 0;
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
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