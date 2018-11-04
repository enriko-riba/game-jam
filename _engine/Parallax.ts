import * as PIXI from 'pixi.js';

/**
 *   Represents a parallax background with textures that tile inside the viewport. 
 */
export class Parallax extends PIXI.Container {

    private viewPortSize!: PIXI.Point;
    private worldPosition: number = 0;
    private halfSizeX!: number;
    private parallaxFactor: number;

    private startIDX: number = 0;
    private endIDX: number = 0;
    private spriteBuffer: Array<PIXI.Sprite> = [];

    /**
     *   Creates a new ParalaxSprite instance.
     */
    constructor(size?: PIXI.Point, parallaxFactor?: number, private textureScale?: number) {
        super();
        this.ViewPortSize = size || new PIXI.Point(100, 100);
        this.parallaxFactor = parallaxFactor || 1;
        this.textureScale = this.textureScale || 1;
    }

    public get WorldPosition(){
        return this.worldPosition;
    }

    public SetViewPortX(newPositionX: number): void {
        if (this.worldPosition !== newPositionX) {
            this.recalculatePosition(newPositionX);
        }
    }

    public get ViewPortSize(): PIXI.Point {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
        this.halfSizeX = this.viewPortSize.x / 2;
    }
    public get ParallaxFactor(): number {
        return this.parallaxFactor;
    }
    public set ParallaxFactor(factor: number) {
        this.parallaxFactor = factor;
    }

    public setTextures(textures: Array<string | PIXI.Texture>): void {
        this.startIDX = 0;
        this.endIDX = 0;

        var totalWidth = 0;
        var index = 0;
        let len = textures.length - 1;
        while (totalWidth <= this.viewPortSize.x || this.spriteBuffer.length < 3 || this.spriteBuffer.length < textures.length) {

            //  get the texture
            var t: PIXI.Texture;
            var textureIndex = index % len;
            if (typeof textures[textureIndex] === "string") {
                t = PIXI.loader.resources[textures[textureIndex] as string].texture;
            } else {
                t = textures[textureIndex] as PIXI.Texture;
            }
            //t.rotate = 8;

            // create a sprite
            var spr = new PIXI.Sprite(t);
            spr.x = totalWidth;
            spr.scale.set(this.textureScale, this.textureScale);
            this.spriteBuffer.push(spr);
            this.addChild(spr);

            //  if sprite is inside VP add & update last index
            if (spr.x < this.viewPortSize.x) {
                this.endIDX = index;
            }

            //  update 
            totalWidth += spr.width;// t.width;
           // console.log(`${t.baseTexture.imageUrl} -> width: ${t.width} spr width: ${spr.width}, total width: ${totalWidth}`);

            index++;            
        }
    }

    private recalculatePosition = (newPositionX: number) => {
        var firstSpr: PIXI.Sprite = this.spriteBuffer[this.startIDX];
        var lastSpr: PIXI.Sprite = this.spriteBuffer[this.endIDX];

        var delta: number = this.worldPosition - newPositionX;
        var parallaxDistance: number = delta * (1 - this.parallaxFactor);

        //  update sprite positions
        for (var i = 0, len = this.children.length; i < len; i++) {
            let spr: PIXI.Sprite = this.children[i] as PIXI.Sprite;
            spr.x -= this.parallaxFactor == 1 ? delta : parallaxDistance;
        }
        this.worldPosition = newPositionX;

        if (delta > 0) {
            //  check for removals from left side
            if (firstSpr.x + firstSpr.width < (this.worldPosition - this.halfSizeX)) {
                firstSpr.visible = false;
                this.startIDX++;
                if (this.startIDX >= this.spriteBuffer.length) {
                    this.startIDX = 0;
                }
            }

            //  check for new sprites from right side
            if (lastSpr.x + lastSpr.width <= this.worldPosition + this.halfSizeX) {
                this.endIDX++;
                if (this.endIDX >= this.spriteBuffer.length) {
                    this.endIDX = 0;
                }
                var newSpr = this.spriteBuffer[this.endIDX];
                newSpr.x = lastSpr.x + lastSpr.width;
                newSpr.visible = true;
            }

        } else {
            //  check for removals from right side
            if (lastSpr.x > (this.worldPosition + this.halfSizeX)) {
                lastSpr.visible = false;
                this.endIDX--;
                if (this.endIDX < 0) {
                    this.endIDX = this.spriteBuffer.length - 1;
                }
            }

            //  check for new sprites from left side
            if (firstSpr.x >= (this.worldPosition - this.halfSizeX)) {
                this.startIDX--;
                if (this.startIDX < 0) {
                    this.startIDX = this.spriteBuffer.length - 1;
                }
                var newSpr = this.spriteBuffer[this.startIDX];
                newSpr.x = firstSpr.x - newSpr.width;
                newSpr.visible = true;
            }
        }
    };
}

