import { LevelDefinitions } from '../global';
import { eventEmitter, DAMAGE_TOPIC, STATCHANGE_TOPIC, BURN_TOPIC} from "../events";
import { LevelLoader } from '../world/LevelLoader';
import { ILevel } from '../world/LevelInterfaces';

export enum BaseStatType {
    MaxHP,
    MaxDust,
    RegenHP,
    RegenDust,
}
export enum StatType {
    MaxHP,
    HP,

    MaxDust,
    Dust,

    RegenHP,
    RegenDust,

    Coins,
    Gold,           //  not used

    LevelExp,       // calculated value: current level exp, starts from 0 each level
    LevelMaxExp,    // calculated value: current level exp needed to reach next level 
    TotalExp,       // total exp  

    AttributePoints,

    CharacterLevel, // calculated value: current char level based on total experience
}

export enum DamageType {
    LavaBorder = 1000,
    Lava = 1001,
    Poison = 1002
}

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


class PlayerStats {
    /**
     * Base stats are fixed values increased with level.
     */
    private baseStats: Array<number> = [];

    /**
     * Attribute stats are player assigned values (point distribution).
     */
    private attributeStats: Array<number> = [];
    
    private stats: Array<number> = [];

    private accumulator: number = 0.0;
    private dpsDecreaseAmount: number = 0;
    private static expForLevel: Array<number> = [];

    //  acquired skills
    private hasJumpAttack: boolean = false;
    private hasMagicAttack: boolean = false;

    //  achievement levels
    public characterLevel: number = 0;
    public currentGameLevel: number = 1;
    private expForNextLevel: number = 0;

    //  user related
    public id: number;
    public name: string;

    private isBurningBuff: boolean = false;

    /**
     *   Stores timestamps (Unix timestamps in seconds with fractions) when the buff elapses.
     */
    public buffs: Array<number> = [];

    private levelLoader : LevelLoader;

    constructor() {
        this.id = 0;

        //  attr  stats
        this.attributeStats[BaseStatType.RegenHP] = 0;
        this.attributeStats[BaseStatType.RegenDust] = 0;
        this.attributeStats[BaseStatType.MaxHP] = 0;
        this.attributeStats[BaseStatType.MaxDust] = 0;

        //  base stats
        this.baseStats[BaseStatType.MaxHP] = 150;
        this.baseStats[BaseStatType.MaxDust] = 1000;
        this.baseStats[BaseStatType.RegenHP] = 1;
        this.baseStats[BaseStatType.RegenDust] = 2;

        // runtime stats
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 0;
        this.stats[StatType.HP] = 0;
        this.stats[StatType.MaxDust] = 0;
        this.stats[StatType.Dust] = 100;
        this.stats[StatType.TotalExp] = 0;
        this.stats[StatType.AttributePoints] = 0;

        this.stats[StatType.MaxDust] = 1000;
        this.stats[StatType.MaxHP] = 150;
        this.stats[StatType.HP] = 120;

        let diff = 1000;
        PlayerStats.expForLevel[0] = 0;
        for (var i = 1; i < 10000; i++) {
            PlayerStats.expForLevel[i] = PlayerStats.expForLevel[i - 1] + (i * diff);
        }

        this.rebuildStats();
    }

    /**
     * Rteurns the level loader.
     */
    public get LevelLoader(){
        if(!this.levelLoader){
            this.levelLoader = new LevelLoader(LevelDefinitions);
        }
        return this.levelLoader;
    }

    /**
     *  Updates stats that increase/decrease over time.
     *  The update is calculated in a half second interval.
     */
    public onUpdate = (dt: number) => {

        let INTERVAL = 500;
        let SECOND_2_INTERVAL = INTERVAL / 1000; //  this factor converts per second values to per interval values

        var now = performance.now() / 1000;

        //  accumulate dps
        for (let i = 1000, len = this.buffs.length; i < len; i++) {
            if (this.buffs[i] && this.buffs[i] > now) {
                let dps = 0;
                switch (i) {
                    case DamageType.LavaBorder:  
                        dps = 5;
                        break;
                    case DamageType.Lava:  
                        dps = 15;
                        break;
                    case DamageType.Poison:  
                        dps = 10;
                        break;
                }
                let dmg = dt * 0.001 * dps;
                this.dpsDecreaseAmount += dmg;
            }
        }

        //  handle once per interval ticks
        this.accumulator += dt;
        if (this.accumulator > INTERVAL) {
            this.accumulator -= INTERVAL;

            //  dust
            if (this.stats[StatType.Dust] < this.stats[StatType.MaxDust]) {
                let v = this.stats[StatType.RegenDust] * SECOND_2_INTERVAL;
                this.increaseStat(StatType.Dust, v);
            }

            //  hp
            if (this.stats[StatType.HP] < this.stats[StatType.MaxHP]) {
                let v = this.stats[StatType.RegenHP] * SECOND_2_INTERVAL;
                this.increaseStat(StatType.HP, v);
            }

            //  dps
            if (this.dpsDecreaseAmount >= 1) {
                var amount = Math.floor(this.dpsDecreaseAmount);
                let event: IDpsChangeEvent = {
                    OldValue: this.stats[StatType.HP],
                    Amount: -amount
                };                
                eventEmitter.emit(DAMAGE_TOPIC, event);
                this.increaseStat(StatType.HP, -amount);
                this.dpsDecreaseAmount -= amount;
            }
        }

        //--------------------------
        //  check if is burning
        //--------------------------
        let wasBurning = this.isBurningBuff;
        this.isBurningBuff = this.buffs[DamageType.LavaBorder] > now || this.buffs[DamageType.Lava] > now;
        if (wasBurning !== this.isBurning) {            
            eventEmitter.emit(BURN_TOPIC, { wasBurning: wasBurning, isBurning: this.isBurningBuff });
        }
    };

    /**
     * Returns true if the player is taking burn damage.
     */
    public get isBurning() {
        return this.isBurningBuff;
    }

    /**
     * The parsed current level.
     */
    public currentLevel : ILevel;

    public loadLevel(){
        this.loadUserState();
        this.currentLevel =  this.LevelLoader.buildLevel(this.currentGameLevel);
    }

    /**
     * Saves user data.
     */
    public saveUserState(isLevelCompleted: boolean) {
        if (isLevelCompleted) {
            this.currentGameLevel += 1;
        }
        let model = {
            ExternalId: this.id,
            Coins: this.stats[StatType.Coins],
            Gold: this.stats[StatType.Gold],
            Dust: Math.floor(this.stats[StatType.Dust]),
            Exp: this.stats[StatType.TotalExp],
            AtrPts: this.stats[StatType.AttributePoints],
            HP: this.stats[StatType.HP],
            LastLevel: this.currentGameLevel,
            // TODO: add sending skills etc.
        };
        // AjaxHelper.Post(baseUrl + "/api/user/save", model, (data, status) => {
        //     console.log("connectUser() response", data);
        // });
        //TODO: implement
    }

    /**
     * Loads user data.
     */
    public loadUserState() {
        let model = { id: this.id };
        var data = {
            Exp : 100,
            HP: 150,
            Coins: 300,
            Gold: 0,
            Dust: 200,
            AtrPts: 0,
            LastLevel: 1
        };
        //  todo: http get
        console.log("loadUserState() response", data);

            stats.currentGameLevel = data.LastLevel;

            //  we never accept 0 hp, convert to full health instead
            if (data.HP <= 0) {
                data.HP = this.stats[StatType.MaxHP];
            }
            this.setStat(StatType.HP, data.HP);
            this.setStat(StatType.Coins, data.Coins);
            this.setStat(StatType.Gold, data.Gold);
            this.setStat(StatType.Dust, data.Dust);
            this.setStat(StatType.AttributePoints, data.AtrPts);
            this.setStat(StatType.TotalExp, data.Exp);
            //  TODO: attributeStats
            this.rebuildStats();
    }

    public get HasJumpAtack() {
        return this.hasJumpAttack;
    }
    public set HasJumpAtack(value: boolean) {
        this.hasJumpAttack = value;
    }


    public setStat(type: StatType, value: number) {
        this.stats[type] = value;
        if (type === StatType.TotalExp) {
            this.characterLevel = PlayerStats.findExpLevel(value);
            this.stats[StatType.LevelMaxExp] = PlayerStats.expForLevel[this.characterLevel + 1] - PlayerStats.expForLevel[this.characterLevel];
            this.stats[StatType.LevelExp] = this.stats[StatType.TotalExp] - PlayerStats.expForLevel[this.characterLevel];
            this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];
        }
        this.updateEvent(type, value);
        eventEmitter.emit(STATCHANGE_TOPIC, this.scevent);
    }

    public getStat(type: StatType): number {
        return this.stats[type];
    }

    public increaseStat(type: StatType, value: number, maxValue?: number) {

        var newValue = this.stats[type] + value;
        if (maxValue && newValue > maxValue) {
            newValue = maxValue;
        }
        if (newValue < 0) {
            newValue = 0;
        }

        this.updateEvent(type, newValue);
        this.stats[type] = newValue;

        //  special logic for experience
        if (type === StatType.TotalExp) {
            this.stats[StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];

            //  level up check
            if (newValue >= this.expForNextLevel) {
                this.characterLevel = PlayerStats.findExpLevel(newValue);
                this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];

                this.stats[StatType.LevelMaxExp] = this.expForNextLevel - PlayerStats.expForLevel[this.characterLevel];
                this.stats[StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];

                //  lvl up event
                this.scevent.Type = StatType.CharacterLevel;
                this.scevent.OldValue = this.characterLevel - 1;
                this.scevent.NewValue = this.characterLevel;
                this.scevent.Stats = this.stats;

                //  attr change event
                newValue = this.stats[StatType.AttributePoints] + 5;
                this.scevent.Type = StatType.AttributePoints;
                this.scevent.OldValue = this.getStat(StatType.AttributePoints);
                this.scevent.NewValue = newValue;
                this.setStat(StatType.AttributePoints, newValue);
                this.scevent.Stats = this.stats;
                
                // refill HP & dust
                this.setStat(StatType.Dust, this.stats[StatType.MaxDust]);
                this.setStat(StatType.HP, this.stats[StatType.MaxHP]);

                //  prepare regular stat change event (for exp)
                this.scevent.Type = type;
                this.scevent.OldValue = 0;
                this.scevent.NewValue = this.stats[StatType.LevelExp];
                this.scevent.Stats = this.stats;

                //this.saveUserState(false);
            }
        }

        eventEmitter.emit(STATCHANGE_TOPIC, this.scevent);
    }

    /**
     * Finds the exp level for the given total exp value.
     * @param exp
     */
    public static findExpLevel(exp: number) {
        for (var i = 0, len = PlayerStats.expForLevel.length; i < len; i++) {
            if (exp < PlayerStats.expForLevel[i]) {
                return i - 1;
            }
        }
    }


    /**
     * Searches the exp level starting from the current exp level.
     * @param exp
     */
    //private findExpLevelInternal(exp: number) {
    //    for (var i = this.characterLevel, len = PlayerStats.expForLevel.length; i < len; i++) {
    //        if (exp < PlayerStats.expForLevel[i]) {
    //            return i - 1;
    //        }
    //    }
    //}

    private rebuildStats() {
        //  calc max & regen stats
        this.baseStats[BaseStatType.MaxHP] = 150 + (this.characterLevel * 10);
        this.baseStats[BaseStatType.MaxDust] = 1000 + (this.characterLevel * 50);
        this.baseStats[BaseStatType.RegenDust] = 2 + (this.characterLevel / 2);
        this.baseStats[BaseStatType.RegenHP] = 1 + (this.characterLevel / 2);

        //  each max attribute increases base stat by 10%
        this.stats[StatType.MaxHP] = this.baseStats[BaseStatType.MaxHP] * (1 + this.attributeStats[BaseStatType.MaxHP]/10);
        this.stats[StatType.MaxDust] = this.baseStats[BaseStatType.MaxDust] * (1 + this.attributeStats[BaseStatType.MaxDust] / 10);

        //  each regen attribute increases base stat by 10%
        this.stats[StatType.RegenHP] = this.baseStats[BaseStatType.RegenHP] * (1 + this.attributeStats[BaseStatType.RegenHP] / 10);
        this.stats[StatType.RegenDust] = this.baseStats[BaseStatType.RegenDust] * (1 + this.attributeStats[BaseStatType.RegenDust] / 10);
    }

    private scevent: IStatChangeEvent = {
        Type: StatType.Coins,
        OldValue: 0,
        NewValue: 0,
        Stats: []
    };

    private updateEvent(type: StatType, newValue: number) {
        this.scevent.Type = type;
        this.scevent.OldValue = this.stats[type];
        this.scevent.NewValue = newValue;
        this.scevent.Stats = this.stats;
    }
}

export var stats = new PlayerStats();