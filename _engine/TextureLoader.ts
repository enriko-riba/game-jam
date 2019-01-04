import { PIXI } from "..";
export class TextureLoader{

    private static resourceCache = {};

    public static Get = (fullName: string, mipmap: boolean = false): PIXI.Texture | null => {
        var idx = fullName.indexOf('.json@');
        var textureName = (idx > 0) ? fullName.substr(idx + 6) : fullName; 
        var resourceName =    (idx > 0) ? fullName.substr(0, idx + 5) : fullName;   
        if(!TextureLoader.resourceCache[resourceName]) {
            TextureLoader.resourceCache[resourceName] = PIXI.loader.resources[resourceName];
            TextureLoader.resourceCache[resourceName].spritesheet.baseTexture.mipmap = mipmap;
        }
        var res = TextureLoader.resourceCache[resourceName];

        if(!res){
            console.error(`Resource:'${fullName}' not found!`);
            return null;
        }

        if(res.loadType == 2){
            return res.texture;
        } else if(res.loadType == 1){
            
            var t = res.textures[textureName];
            t.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            //t.baseTexture.mipmap = false;
            return t;
        }else{
            console.error(`Resource:'${fullName}' unknown load type!`, res);
        }  
        return null;      
    }

    public static IsAtlas(texture:PIXI.Texture) {
        return texture.frame.width != texture.baseTexture.width || texture.frame.height != texture.baseTexture.height;
    }
}