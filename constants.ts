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

export const TEXT_STYLE: PIXI.TextStyleOptions = {
    align: "left",
    padding: 0,
    fontSize: 21,
    fontFamily: GUI_FONT,
    fill: 0xE5E51B,
    strokeThickness: 3,
    stroke: 0x0f0f2f,
};

export const MSG_COIN_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 22,
    fontFamily: GUI_FONT,
    fill: 0xaaaa00,
    strokeThickness: 3,
    stroke: 0x904b15
};

export const MSG_HP_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 24,
    fontFamily: GUI_FONT,
    fill: 0x904b15,
    strokeThickness: 3,
    stroke: 0x111111
};

export const MSG_EXP_STYLE: PIXI.TextStyleOptions =
    {
        align: "center",
        padding: 0,
        fontSize: 24,
        fontFamily: GUI_FONT,
        fill: 0x84c202,
        strokeThickness: 3,
        stroke: 0x112111
    };

export const MSG_WARN_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 27,
    fontFamily: GUI_FONT,
    fill: 0xff0011,
    strokeThickness: 4,
    stroke: 0x222222
};

export const EXP_BAR_STYLE: PIXI.TextStyleOptions =
{
    align: "center",
    padding: 0,
    fontSize: 13,
    fontFamily: GUI_FONT,
    fill: 0x111111,
    strokeThickness: 4,
    stroke: 0xffffff
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

    export const QUEST_STYLE: PIXI.TextStyleOptions =
    {
        align: "center",
        padding: 0,
        fontSize: 30,
        fontFamily: "Farsan",
        fill: 0xffffff,
        strokeThickness: 2,
        stroke: 0x8a8343,
        dropShadow: true,
        dropShadowDistance: 6,
        dropShadowBlur:3
    };