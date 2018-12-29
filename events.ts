import { StatType } from './enums';

export var eventEmitter = new PIXI.utils.EventEmitter();
export var MOVE_TOPIC = "MOVE";
export var BURN_TOPIC = "BURN";
export var STATCHANGE_TOPIC = "stat_changed";
export var DAMAGE_TOPIC = "DAMAGE";

export interface IStatChangeEvent {
    Type: StatType;
    OldValue: number;
    NewValue: number;
    Stats: Array<number>;
}

export interface IDpsChangeEvent {
    OldValue: number;
    Amount: number;
}

export interface IBurnChangeEvent {
    isBurning: boolean;
}