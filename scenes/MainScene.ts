import { PIXI, SceneManager, Global, Dictionary, Scene, Parallax } from "..";
import { HeroCharacter } from '../objects/HeroCharacter';
import * as TWEEN from "@tweenjs/tween.js";
import { WorldP2 } from '../objects/WorldP2';



const pdef = [
    {
      "name": "Background",
      "parallaxFactor": 0.25,
      "y": 20,
      "textures": [
        "assets/img/Mountains.png"
      ]
    },
    {
      "name": "Far",
      "parallaxFactor": 0.45,
      "y": 25,
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
      "y": 10,
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
      "y": -85,
      "scale": 1,
      "textures": [
        "assets/img/ground.png"
      ]
    },
    {
      "name": "Bushes",
      "parallaxFactor": 1,
      "y": -70,
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
    private hero: HeroCharacter;
    public wp2: WorldP2;
    
    constructor(scm: SceneManager) {
        super(scm, "Main");
        this.BackGroundColor = Global.SCENE_BACKCOLOR;
        this.setup();     
    }
    
    public onUpdate(dt: number) {
      this.wp2.update(dt);
      this.hero.update(dt);
        
      //-------------------------------------------
      //  update world container position
      //-------------------------------------------        
      this.worldContainer.x = (Global.SCENE_HALF_WIDTH - this.hero.x);
      this.worldContainer.y = (Global.SCENE_HEIGHT - 70);

      //-------------------------------------------
      //  update parallax
      //-------------------------------------------
      this.parallax.forEach( p => {
        p.SetViewPortX(this.hero.x);
        p.position.x = this.hero.x - Global.SCENE_HALF_WIDTH;
      });

      
      //-------------------------------------------
      //  invoke update on each updateable
      //-------------------------------------------
      for (var i = 0, len = this.worldContainer.children.length; i < len; i++) {
        let child: any = this.worldContainer.children[i];
        if (child && child.onUpdate) {
            child.onUpdate(dt);
        }
      };
    }
    
    private setup(){
        this.worldContainer = new PIXI.Container();
        this.worldContainer.scale.y = -1;

        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);        
        pdef.forEach((p, idx) => {
            var parallax = new Parallax(vps, p.parallaxFactor, p.scale);
            parallax.setTextures(p.textures);
            parallax.y = p.y;
            this.parallax.push(parallax);
            this.worldContainer.addChildAt(parallax, idx);
        });
        this.addChild(this.worldContainer);

        //-----------------------------
        //  setup hero 
        //-----------------------------     
        this.hero = new HeroCharacter(this.worldContainer);
        this.hero.name = "hero";
        this.hero.x = Global.SCENE_HALF_WIDTH;

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2();
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);

        this.wp2.playerBody.position[0] = Global.SCENE_HALF_WIDTH;
        this.wp2.playerBody.position[1] = 10;
        Global.stats.position.x = Global.SCENE_HALF_WIDTH;
        Global.stats.position.y = 10;

        this.hero.play("idle", Global.ANIMATION_FPS_SLOW);
    }
}