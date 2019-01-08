export const SCENE_WIDTH: number = 1920;
export const SCENE_HEIGHT: number = 1080;
export const SCENE_HALF_WIDTH = SCENE_WIDTH / 2;
export const SCENE_HALF_HEIGHT = SCENE_HEIGHT / 2;
export const BTN_WIDTH: number = 120;
export const BTN_HEIGHT: number = 60;
export const MENU_LINE_HEIGHT = 60;
export const GUI_FONT = "Orbitron";

export const SCENE_BACKCOLOR = 0x112233;


export const ANIMATION_FPS_NORMAL = 14;
export const ANIMATION_FPS_SLOW = 4;

export const BTN_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 28,
    fontFamily: GUI_FONT,
    fill: 0x46fbfd,
    strokeThickness: 1,
    stroke: 0x0
};

export const TEXT_STYLE: PIXI.extras.BitmapTextStyle = {
    align: "left",
    font: "21px Orbitron",
    tint: 0xE5E51B,
};

export const MSG_COIN_STYLE : PIXI.extras.BitmapTextStyle =
{
    align: "left",
    font: "22px Orbitron",
    tint: 0xfeff44,
};

export const MSG_HP_STYLE: PIXI.extras.BitmapTextStyle =
{
    align: "center",
    font: "24px Orbitron",
    tint: 0xff1111    
};

export const MSG_EXP_STYLE: PIXI.extras.BitmapTextStyle =
    {
        align: "center",
        font: "24px Orbitron",
        tint: 0x84c202,
    };

export const MSG_WARN_STYLE: PIXI.extras.BitmapTextStyle =
{
    align: "center",
    font: "27px Orbitron",
    tint: 0xff0011,
};

export const QUEST_ITEM_STYLE: PIXI.TextStyleOptions =
    {
        align: "center",
        padding: 0,
        fontSize: 28,
        fontFamily: "Farsan",
        fill: 0x84c2f2,
        strokeThickness: 4,
        stroke: 0x111121
    };

    export const QUEST_STYLE: PIXI.extras.BitmapTextStyle =
    {
        align: "left",
        font: "24px Orbitron",
        tint: 0xfeffcc,
    };