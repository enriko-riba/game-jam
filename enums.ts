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


export enum AtrType {
    HP,
    Atk,
    AtkCD,
    Def,
}

export enum DirectionH {
    Left,
    Right,
}