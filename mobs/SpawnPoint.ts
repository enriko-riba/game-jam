import * as Global from "../global";
import { LevelLoader } from "../objects/LevelLoader";
import { WorldP2 } from "../objects/WorldP2";
import { Mob } from "../mobs/Mob";
import { AnimatedSprite, AnimationSequence } from "../_engine/AnimatedSprite";

export class SpawnPoint {
    private mobCount: number = 0;
    private nextSpawn: number = 0;
    private templates;
    private worldContainer: PIXI.Container;;
    private wp2: WorldP2;;

    constructor(public name: string,
        private x: number,
        private y: number,
        private area: number,
        private maxMobCount: number,
        private respawnSeconds: number,
        private entity: any,
        private active: boolean = true){

        this.nextSpawn = performance.now() / 1000;
       
    }

    public get IsActive() { return this.active; };
    public set IsActive(value: boolean) { this.active = value; };

    public onUpdate(dt: number) {
        if (this.active && this.mobCount < this.maxMobCount) {

            //  is it time to respawn?
            var now = performance.now() / 1000;
            if (this.nextSpawn <= now) {

                //  grab the level templates if not present
                if (!this.templates) {
                    var igs: any = Global.getScm().GetScene("InGame");
                    this.templates = igs.currentLevel.templates;
                    this.worldContainer = igs.worldContainer as PIXI.Container;
                    this.wp2 = igs.wp2 as WorldP2;
                }

                var mobBody = LevelLoader.createMob(this.templates, this.entity);
                let dispObj = (mobBody as any).DisplayObject as Mob;

                let x = this.x + (Math.random() * this.area) - (this.area / 2);
                let y = this.y;

                mobBody.position = [x, y];
                this.wp2.addBody(mobBody);

                dispObj.position.set(x, y);
                dispObj.visible = false;
                dispObj.isLoading = true;
                this.worldContainer.addChild(dispObj);

                let loadSpr = new AnimatedSprite();
                loadSpr.addAnimations(new AnimationSequence("load", "assets/_distribute/load.png", [0, 1, 2, 3], 64, 64));
                loadSpr.anchor.set(0.5);
                loadSpr.position.set(x, y+10);
                loadSpr.play("load", 4, true);
                //loadSpr.scale.set(1, -1);
                this.worldContainer.addChild(loadSpr);

                setTimeout(() => {
                    this.worldContainer.removeChild(loadSpr);
                    dispObj.isLoading = false;
                    dispObj.visible = true;
                }, 3000);

                (dispObj as Mob).onDeath = () => {
                    console.log("mob died");
                    this.mobCount--;
                }

                this.mobCount++;
                this.nextSpawn = (performance.now() / 1000) + this.respawnSeconds;
            }
        }
    }
}