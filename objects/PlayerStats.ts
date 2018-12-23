import {eventEmitter, DPS_TOPIC, STATCHANGE_TOPIC} from "../global";

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

    LevelExp,       // calculate value: current level exp, starts from 0 each level
    LevelMaxExp,    // calculated value: current level exp needed to reach next level 
    TotalExp,       // total exp  

    AttributePoints,

    CharacterLevel, // calculated value: current char level based on total experience
}

export enum DpsType {
    LavaBorder,
    Lava,
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



export class PlayerStats {
    private baseStats: Array<number> = [];
    private attributeStats: Array<number> = [];
    private stats: Array<number> = [];

    private accumulator: number = 0.0;
    private dpsDecreaseAmount: number = 0;

    private attributes: Array<number> = [];

    private static expForLevel: Array<number> = [];

    //  acquired skills
    private hasJumpAttack: boolean = false;
    private hasMagicAttack: boolean = false;

    //  achievement levels
    public characterLevel: number = 0;
    public gameLevel: number = 0;
    private expForNextLevel: number = 0;

    //  user related
    public id: number;
    public name: string;
    public position: PIXI.Point;



    /**
     *   Stores timestamps (Unix timestamps in seconds with fractions) when the buff elapses.
     */
    public buffs: Array<number> = [];


    constructor() {
        this.id = 0;
        this.position = new PIXI.Point();

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
        this.stats[StatType.Dust] = 0;
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
                    case 1000:  // lava border
                        dps = 5;
                        break;
                    case 1001:  // lava
                        dps = 15;
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
                let event = {
                    OldValue: this.stats[StatType.HP],
                    Amount: -amount
                };                
                eventEmitter.emit(DPS_TOPIC, event);
                this.increaseStat(StatType.HP, -amount);
                this.dpsDecreaseAmount -= amount;
            }
        }
    };

    /**
     * Saves user data.
     */
    public saveUserState(isLevelCompleted: boolean) {
        if (isLevelCompleted) {
            this.gameLevel += 1;
        }
        let model = {
            ExternalId: this.id,
            Coins: this.stats[StatType.Coins],
            Gold: this.stats[StatType.Gold],
            Dust: Math.floor(this.stats[StatType.Dust]),
            Exp: this.stats[StatType.TotalExp],
            AtrPts: this.stats[StatType.AttributePoints],
            HP: this.stats[StatType.HP],
            LastLevel: this.gameLevel,
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
    // public loadUserState(): Promise<boolean> {
    //     var promise = $.Deferred();

    //     let model = { id: this.id };
    //     AjaxHelper.GetWithData(baseUrl + "/api/user/data", model, (data, status) => {
    //         console.log("resetPlayerStats() response", data);

    //         this.gameLevel = data.LastLevel;
    //         this.setStat(StatType.TotalExp, data.Exp);
    //         //  TODO: attributeStats
    //         this.rebuildStats();


    //         //  we never accept 0 hp, convert to full health instead
    //         if (data.HP <= 0) {
    //             data.HP = this.stats[StatType.MaxHP];
    //         }
    //         this.setStat(StatType.HP, data.HP);
    //         this.setStat(StatType.Coins, data.Coins);
    //         this.setStat(StatType.Gold, data.Gold);
    //         this.setStat(StatType.Dust, data.Dust);
    //         this.setStat(StatType.AttributePoints, data.AtrPts);

    //         //this.setStat(StatType.MaxDust, 1000);
    //         //this.setStat(StatType.MaxHP, 150);
    //         //this.setStat(StatType.HP, 120);

    //         promise.resolve(true);
    //     });

    //     return promise;
    // }
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
        //ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
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
                //ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);

                //  attr change event
                newValue = this.stats[StatType.AttributePoints] + 5;
                this.scevent.Type = StatType.AttributePoints;
                this.scevent.OldValue = this.getStat(StatType.AttributePoints);
                this.scevent.NewValue = newValue;
                this.setStat(StatType.AttributePoints, newValue);
                this.scevent.Stats = this.stats;
                //ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
                
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

        //ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
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