declare namespace PIXI {
    export interface IBitmapTextStyle{
        font: {
            name?: string;
            size?: number;
        };
        align?: string;
        tint?: number;
    } 

    export interface ITextStyle{
        align?: string;
        breakWords?: boolean;
        dropShadow?: boolean;
        dropShadowAlpha?: number;
        dropShadowAngle?: number;
        dropShadowBlur?: number;
        dropShadowColor?: string | number;
        dropShadowDistance?: number;
        fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        fillGradientType?: number;
        fillGradientStops?: number[];
        fontFamily?: string | string[];
        fontSize?: number | string;
        fontStyle?: string;
        fontVariant?: string;
        fontWeight?: string;
        leading?: number;
        letterSpacing?: number;
        lineHeight?: number;
        lineJoin?: string;
        miterLimit?: number;
        padding?: number;
        stroke?: string | number;
        strokeThickness?: number;
        trim?: boolean;
        textBaseline?: string;
        whiteSpace?: string;
        wordWrap?: boolean;
        wordWrapWidth?: number;  
    } 
}