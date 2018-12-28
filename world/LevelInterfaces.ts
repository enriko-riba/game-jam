import { Parallax } from '..';
import { SpawnPoint } from '../mobs/SpawnPoint';

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

/**
 * Used with PIXI.DisplayObject
 */
export interface IInteractionType {
    interactionType?: number;
    drop?: IDrop;
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