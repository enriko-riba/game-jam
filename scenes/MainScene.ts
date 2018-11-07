import { PIXI, SceneManager, Global, Dictionary, Scene, Parallax } from "..";
import { HeroCharacter } from '../objects/HeroCharacter';
import * as TWEEN from "@tweenjs/tween.js";
import { WorldP2 } from '../objects/WorldP2';

let ANIMATION_FPS_NORMAL = 9;
let ANIMATION_FPS_SLOW = 4;

const pdef = [
    {
      "name": "Background",
      "parallaxFactor": 0.25,
      "y": 100,
      "textures": [
        "assets/img/Mountains.png"
      ]
    },
    {
      "name": "Far",
      "parallaxFactor": 0.45,
      "y": 100,
      "scale": 1.4,
      "textures": [
        "assets/img/trees01.png",
        "assets/img/trees02.png",
        "assets/img/trees03.png",
        "assets/img/trees04.png",
        "assets/img/trees05.png" 
      ]
    },
    {
      "name": "Near",
      "parallaxFactor": 0.65,
      "y": 90,
      "scale": 1.2,
      "textures": [
       
        "assets/img/trees06.png",
        "assets/img/trees07.png",
        "assets/img/trees08.png",
        "assets/img/trees09.png"   
      ]
    },
    {
      "name": "Ground",
      "parallaxFactor": 1,
      "y": -15,
      "scale": 1,
      "textures": [
        "assets/img/ground.png"
      ]
    },
    {
      "name": "Bushes",
      "parallaxFactor": 1,
      "y": 0,
      "scale": 1,
      "textures": [
        "assets/img/front01.png",
        "assets/img/front02.png"
      ]
    }
  ];

export class MainScene extends Scene {
    private worldContainer: PIXI.Container;
    private parallax: Parallax[] = [];
    private wx : number = 0;
    private hero: HeroCharacter;
    public wp2: WorldP2;
    
    constructor(scm: SceneManager) {
        super(scm, "Main");
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
        this.setup();     
    }
    public onUpdate(dt: number) {
        this.wx += dt * 0.1;
        this.parallax.forEach(p=> p.SetViewPortX(-this.wx));
    }
    
    private setup(){
        this.worldContainer = new PIXI.Container();

        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);        
        pdef.forEach((p, idx) => {
            var parallax = new Parallax(vps, p.parallaxFactor, p.scale);
            parallax.setTextures(p.textures);
            parallax.y = Global.SCENE_HEIGHT - p.y;
            this.parallax.push(parallax);
            this.worldContainer.addChildAt(parallax, idx);
        });
        this.addChild(this.worldContainer);

        //-----------------------------
        //  setup hero
        //-----------------------------     
        this.hero = new HeroCharacter(this.worldContainer);
        this.hero.name = "hero";

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2();
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);
    }
}