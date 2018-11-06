﻿import * as PIXI from 'pixi.js';

/**
 *   Represents a parallax background with textures that tile inside the viewport. 
 */
export class Parallax extends PIXI.Container {

    private viewPortSize!: PIXI.Point;
    private worldPosition: number = 0;
    private halfSizeX!: number;
    private parallaxFactor: number;

    // private firstIDX: number = 0;
    // private lastIDX: number = 0;
    private spriteBuffer: Array<PIXI.Sprite> = [];
    private spriteOrderList: Array<number> = [];

    /**
     * total width of all textures 
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
        var index = 0;
        var textureIndex : number;
        var t: PIXI.Texture;
        while (this.spriteBuffer.length < 3  ||                 //  at least 3 textures (for shifting right/left and central)
               this.spriteBuffer.length < textures.length ||    //  at least as many as given in input
               this.totalWidth <= this.viewPortSize.x   
            ) {

            //  get the texture
            textureIndex = index % textures.length;
            if (typeof textures[textureIndex] === "string") {
                t = PIXI.loader.resources[textures[textureIndex] as string].texture;
            } else {
                t = textures[textureIndex] as PIXI.Texture;
            }

            // create a sprite
            var spr = new PIXI.Sprite(t);
            spr.x = this.totalWidth;
            spr.scale.set(this.textureScale, this.textureScale);
            spr.anchor.set(0, 1);
            this.spriteBuffer.push(spr);
            this.spriteOrderList.push(this.spriteBuffer.length-1); //   will hold sprite indices from spritebuffer [0,1,2,3,4...]
            this.addChild(spr);

            //  update 
            this.totalWidth += spr.width;
            console.log(`${t.baseTexture.imageUrl} -> width: ${t.width} spr width: ${spr.width}, total width: ${this.totalWidth}`);
            index++;            
        }

        //  check if one additional texture must be added in case the total width is less than viewport + 1 texture
        textureIndex = index % textures.length;
        if (typeof textures[textureIndex] === "string") {
            t = PIXI.loader.resources[textures[textureIndex] as string].texture;
        } else {
            t = textures[textureIndex] as PIXI.Texture;
        }
        if(this.totalWidth < this.viewPortSize.x + t.width){
            var spr = new PIXI.Sprite(t);
            spr.x = this.totalWidth;
            spr.scale.set(this.textureScale, this.textureScale);
            spr.anchor.set(0, 1);
            this.spriteBuffer.push(spr);
            this.spriteOrderList.push(this.spriteBuffer.length-1); //   will hold sprite indices from spritebuffer [0,1,2,3,4...]
            this.addChild(spr);
        }
    }

    private recalculatePosition = (newPositionX: number) => {
        const firstIdx = this.spriteOrderList[0];
        const firstSpr: PIXI.Sprite = this.spriteBuffer[firstIdx];
        const lastIdx = this.spriteOrderList[this.spriteOrderList.length-1];
        const lastSpr: PIXI.Sprite = this.spriteBuffer[lastIdx]; 

        //  update sprite positions
        var delta =  (this.worldPosition - newPositionX) * this.parallaxFactor;
        this.updatePositions(delta);

        if (newPositionX > this.worldPosition) {            
            //  check for removals from left side
            if (firstSpr.x + firstSpr.width < 0) {
                this.spriteOrderList.push(this.spriteOrderList.shift());    //  move first element to end
                firstSpr.x = lastSpr.x + lastSpr.width;               
            }            
        } else {
            //  check for removals from right side  
            if (lastSpr.x > this.viewPortSize.x) {
                this.spriteOrderList.unshift(this.spriteOrderList.pop());    //  move last element to start
                lastSpr.x = firstSpr.x - lastSpr.width;               
            }           
        }
        this.worldPosition = newPositionX;
    };

    private updatePositions(delta:number){
        for(var i = 0; i< this.spriteBuffer.length; i++){
            this.spriteBuffer[i].position.x += delta;
        }
    }
}

