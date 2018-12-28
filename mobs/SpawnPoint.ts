import { LevelLoader } from "../world/LevelLoader";
import { wp2 } from "../world/WorldP2";
import { Mob } from "../mobs/Mob";
import { AnimatedSprite, AnimationSequence } from "../_engine/AnimatedSprite";
import { stats } from '../objects/PlayerStats';

export class SpawnPoint {
    private mobCount: number = 0;
    private nextSpawn: number = 0;
    private worldContainer: PIXI.Container;;

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


                var mobBody = LevelLoader.createMob(stats.currentLevel.templates, this.entity);
                let dispObj = (mobBody as any).DisplayObject as Mob;

                let x = this.x + (Math.random() * this.area) - (this.area / 2);
                let y = this.y;

                mobBody.position = [x, y];
                wp2.addBody(mobBody);

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