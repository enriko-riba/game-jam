export class Platform extends PIXI.Container {

    /**
     * 
     * @param tilesX number of horizontal mid tiles. Note: this is the number of mid tiles - the actual width is tilesX + 2
     * @param tilesY number of vertical tiles
     * @param textures array of textures in specific order: top mid, top left, top right, bottom mid, bottom left, bottom right.
     */
    constructor(tilesX: number = 1, tilesY: number = 1, textures:string[]) {
        super();

        this.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system

        var textureNameTopLeft: string,
            textureNameTopRight: string,
            textureNameBtmMid: string,
            textureNameBtmLeft: string,
            textureNameBtmRight: string;

        //  this one must exist
        var textureNameTopMid: string = textures[0];
        if (tilesX > 1 || textures.length > 1) {
            textureNameTopLeft = textures[1];
            textureNameTopRight = textures[2];
        }
        if (tilesY > 1) {
            textureNameBtmMid = textures[3];
            textureNameBtmLeft = textures[4];
            textureNameBtmRight = textures[5];
        }
        var spr: PIXI.Sprite;
        var x = 0;

        //--------------------------
        //  left border
        //--------------------------
        if (textureNameTopLeft) {
            texture = PIXI.loader.resources[textureNameTopLeft].texture;
            spr = new PIXI.Sprite(texture);
            spr.position.set(x+1, 0);
            x += texture.width;
            this.addChild(spr);
        }

        //--------------------------
        //  mid tiles
        //--------------------------
        var texture = PIXI.loader.resources[textureNameTopMid].texture;
        if (tilesX > 1) {
            let w = texture.width * tilesX;
            let h = texture.height;
            spr = new PIXI.extras.TilingSprite(texture, w, h);
            spr.position.set(x, 0);
            x += w;
        } else {
            spr = new PIXI.Sprite(texture);
            spr.position.set(x, 0);
            x += spr.width;
        }
        this.addChild(spr);

        //--------------------------
        //  right border
        //--------------------------
        if (textureNameTopRight) {
            texture = PIXI.loader.resources[textureNameTopRight].texture;
            spr = new PIXI.Sprite(texture);
            spr.position.set(x -1, 0);
            x += spr.width;
            this.addChild(spr);
        }

        //--------------------------
        //  fill downwards
        //--------------------------
        let xTiles = tilesX + 2;
        if (tilesY > 1) {
            for (var x = 0; x < xTiles; x++) {
                var name: string;
                if (x === 0) {
                    name = textureNameBtmLeft;


                } else if (x === xTiles - 1) {
                    name = textureNameBtmRight;
                } else {
                    name = textureNameBtmMid;
                }

                for (var y = 1; y < tilesY; y++) {                    
                    texture = PIXI.loader.resources[name].texture;
                    spr = new PIXI.Sprite(texture);
                    spr.position.set(x * spr.width, y * spr.height);
                    this.addChild(spr);
                }
            }
        }
    }
}