import { AI } from "./AI";
import { Mob } from "./Mob";

/**
 * Can attack and turn towards player but invokes no other actions.
 */
export class BasicStaticAI extends AI {

    constructor(mobEntity: Mob) {
        super(mobEntity);
    }

    public canFire() {
        let nowMilliseconds = performance.now();
        let rnd = Math.random() * 2000;
        let can = (this.lastFire + this.attackCD  + rnd <= nowMilliseconds);
        if (can) {
            let rnd = Math.random();
            can = can && rnd > 0.3;
            this.lastFire = performance.now(); //  set to prevent firing in next update if 'can' is false
        }
        return can;
    };
}