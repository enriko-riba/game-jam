import { PIXI, SceneManager, Global, Dictionary, Scene, Parallax } from "..";
import * as TWEEN from "@tweenjs/tween.js";

const pdef = [
    // {
    //   "name": "Far",
    //   "parallaxFactor": 0.5,
    //   "y": 0,
    //   "textures": [
    //     "assets/img/Mountains.png"
    //   ]
    // },
    // {
    //   "name": "Near",
    //   "parallaxFactor": 0.7,
    //   "y": 5,
    //   "scale": 1.3,
    //   "textures": [
    //     "assets/img/trees06.png",
    //     "assets/img/trees07.png",
    //     "assets/img/trees08.png"
    //   ]
    // },
    {
      "name": "NearSmall",
      "parallaxFactor": 0.75,
      "y": 5,
      "scale": 0.6,
      "textures": [
        "assets/img/trees06.png",
        "assets/img/trees07.png",
        "assets/img/trees08.png",
        "assets/img/trees06.png",
        "assets/img/trees07.png",
        "assets/img/trees08.png"
      ]
    },
    {
      "name": "Ground",
      "parallaxFactor": 1,
      "y": -10,
      "scale": 1,
      "textures": [
        "assets/img/ground.png"
      ]
    }
  ];

export class MainScene extends Scene {
    private worldContainer: PIXI.Container;
    private parallax: Parallax[] = [];
    private wx : number = 0;

    constructor(scm: SceneManager) {
        super(scm, "Main");
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
        this.setup();     
    }
    public onUpdate(dt: number) {
        this.wx += dt * 0.1;
        this.parallax.forEach(p=> p.SetViewPortX( -this.wx ));
    }
    
    private setup(){
        this.worldContainer = new PIXI.Container();  
        //this.worldContainer.scale.y  =-1; 
        this.worldContainer.position.y = Global.SCENE_HALF_HEIGHT;
        this.addChild(this.worldContainer);
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
        
        pdef.forEach((p, idx) => {
            var parallax = new Parallax(vps, p.parallaxFactor, p.scale);
            parallax.y = Global.SCENE_HEIGHT - p.y;
            parallax.setTextures(p.textures);
            parallax.SetViewPortX(100);
            parallax.SetViewPortX(0);
            this.parallax.push(parallax);
            this.worldContainer.addChildAt(parallax, idx);
        });
    }
}