import * as Global from "../global";
import { Mob, AtrType, DirectionH } from "./Mob";

/**
 * Max distance at which the target can be acquired.
 */
let LOCK_DISTANCE = 800;

/**
 * Max distance at which the target is tracked.
 */
let TRACK_DISTANCE = 1050;

/**
 * Base for all mob AI. Provides low level AI functions.
 */
export class AI {

    /**
     * True if the AI has a 'target lock' on the player.
     */
    protected hasTarget: boolean;

    /**
     * Distance from player.
     */
    protected targetDistance: number;

    protected lastFire: number = 0;//performance.now() + Math.random() * 10;    //  so that the attack is not triggered at init time

    protected attackCD: number;

    constructor(protected mobEntity: Mob) {
        this.attackCD = mobEntity.attributes[AtrType.AtkCD];
    }

    private calcDistance() {
        let dx = Global.stats.position.x - this.mobEntity.x;
        let dy = Global.stats.position.y - this.mobEntity.y;
        this.targetDistance = Math.sqrt(dx * dx + dy * dy);
    }

    private turnTowardsTarget() {
        //  negative left, positive right
        let dir = Global.stats.position.x - this.mobEntity.x;

        if (dir < 0 && this.mobEntity.direction != DirectionH.Left) {
            this.mobEntity.direction = DirectionH.Left;
        } else if (dir > 0 && this.mobEntity.direction != DirectionH.Right) {
            this.mobEntity.direction = DirectionH.Right;
        }
    }

    public canFire() {
        let nowMilliseconds = performance.now();
        return (this.lastFire + this.attackCD <= nowMilliseconds);
    };

    public onUpdate = (dt: number) => {
        this.calcDistance();

        //  TODO: implement visibility check
        if (this.targetDistance < TRACK_DISTANCE) {
            this.turnTowardsTarget();
        }

        if (this.targetDistance < LOCK_DISTANCE) {
            this.hasTarget = true;

            //  check attack CD            
            if (this.canFire()) {
                this.mobEntity.attack();
                this.lastFire = performance.now();
            }
        } else {
            this.hasTarget = false;
        }
    }
}