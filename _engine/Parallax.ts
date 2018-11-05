import * as PIXI from 'pixi.js';

/**
 *   Represents a parallax background with textures that tile inside the viewport. 
 */
export class Parallax extends PIXI.Container {

    private viewPortSize!: PIXI.Point;
    private worldPosition: number = 0;
    private halfSizeX!: number;
    private parallaxFactor: number;

    private firstIDX: number = 0;
    private lastIDX: number = 0;
    private spriteBuffer: Array<PIXI.Sprite> = [];

    /**
     * total textuire width
     */
    private totalWidth: number = 0;

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
        this.firstIDX = 0;
        this.lastIDX = 0;        
        var index = 0;
        
        while (this.totalWidth <= this.viewPortSize.x || this.spriteBuffer.length < 3 || this.spriteBuffer.length < textures.length - 1) {

            //  get the texture
            let t: PIXI.Texture;
            var textureIndex = index % textures.length;
            if (typeof textures[textureIndex] === "string") {
                t = PIXI.loader.resources[textures[textureIndex] as string].texture;
            } else {
                t = textures[textureIndex] as PIXI.Texture;
            }
            //t.rotate = 8;

            // create a sprite
            var spr = new PIXI.Sprite(t);
            spr.x = this.totalWidth;
            spr.scale.set(this.textureScale, this.textureScale);
            spr.anchor.set(0, 1);
            this.spriteBuffer.push(spr);
            this.addChild(spr);

            //  if sprite is inside VP add & update last index
            if (spr.x < this.viewPortSize.x) {
                this.lastIDX = index;
            }

            //  update 
            this.totalWidth += spr.width;
            console.log(`${t.baseTexture.imageUrl} -> width: ${t.width} spr width: ${spr.width}, total width: ${this.totalWidth}`);
            index++;            
        }
    }

    private recalculatePosition = (newPositionX: number) => {
        var firstSpr: PIXI.Sprite = this.spriteBuffer[this.firstIDX];
        var lastSpr: PIXI.Sprite = this.spriteBuffer[this.lastIDX];

        //  update sprite positions
        var parallPos = ((-newPositionX - this.halfSizeX) * this.parallaxFactor) % this.totalWidth;
        for(var i = 0; i< this.spriteBuffer.length; i++){
            var orderIndex = (this.firstIDX + i) % this.spriteBuffer.length;
            this.spriteBuffer[orderIndex].position.x = parallPos;
            parallPos += this.spriteBuffer[orderIndex].width;
        }
        
        if (newPositionX > this.worldPosition) {
            //  check for removals from left side
            if (firstSpr.x + firstSpr.width < 0) {
                firstSpr.visible = false;
                this.firstIDX++;
                if (this.firstIDX >= this.spriteBuffer.length) {
                    this.firstIDX = 0;
                }
                let newSpr = this.spriteBuffer[this.firstIDX];
                newSpr.x = firstSpr.x + firstSpr.width;
                newSpr.visible = true;
            }
            
            //  check for new sprites from right side
            if (lastSpr.x + lastSpr.width <= this.viewPortSize.x) {
                this.lastIDX++;
                if (this.lastIDX >= this.spriteBuffer.length) {
                    this.lastIDX = 0;
                }
                let newSpr = this.spriteBuffer[this.lastIDX];
                newSpr.x = lastSpr.x + lastSpr.width;
                newSpr.visible = true;
            }
            
        } else {
            //  check for removals from right side
            if (lastSpr.x > this.viewPortSize.x) {
                lastSpr.visible = false;
                this.lastIDX--;
                if (this.lastIDX < 0) {
                    this.lastIDX = this.spriteBuffer.length - 1;
                }
            }
            
            //  check for new sprites from left side
            if (firstSpr.x >= 0) {
                this.firstIDX--;
                if (this.firstIDX < 0) {
                    this.firstIDX = this.spriteBuffer.length - 1;
                }
                var newSpr = this.spriteBuffer[this.firstIDX];
                newSpr.x = firstSpr.x - newSpr.width;
                newSpr.visible = true;
            }
        }
        this.worldPosition = newPositionX;
    };
}

