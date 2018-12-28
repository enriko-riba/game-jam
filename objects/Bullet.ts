/**
 * Base for bullets, decals etc.
 */
export class Bullet extends PIXI.Sprite {
    private direction: PIXI.Point = new PIXI.Point();
    private ttl: number;
    private startTime: number;
    private isDead: boolean;
    private onDeath: () => void;

    /**
     * Creates a new bullet particle.
     *
     * @param texture
     * @param velocity in pixels per second
     * @param ttl time to live in seconds
     * @param damage bullet hit damage
     */
    constructor(texture: PIXI.Texture, public velocity: number, ttl: number, public damage: number) {
        super(texture);

        this.ttl = ttl;
        this.IsDead = false;
        //this.interactionType = 666;
    }

    public body: p2.Body;

    public set Direction(direction: PIXI.Point) {
        //  normalize movement vector
        let len = direction.x * direction.x + direction.y * direction.y;
        len = 1 / Math.sqrt(len);
        this.direction.set(direction.x * len, direction.y * len);
    }
    public get Direction() {
        return this.direction;
    }

    public get IsDead() {
        return this.isDead;
    }
    public set IsDead(value: boolean) {
        if (value != this.isDead) {
            this.isDead = value;
            //console.log("bullet is dead: " + value);

            //  if set to alive remember start time
            if (this.isDead) {
                if (this.body) {
                    this.body.velocity = [0, 0];
                }
            } else {
                this.startTime = performance.now() / 1000;
                if (this.body) {
                    this.body.position = [this.position.x, this.position.y];
                }
            }

            //  fire OnDeath if needed
            if (this.isDead && this.onDeath) {
                this.onDeath();
            }

            this.visible = !this.isDead;
        }
    }

    public set OnDeath(cb: { (): void }) {
        this.onDeath = cb;
    }
    public get OnDeath() {
        return this.onDeath;
    }


    public onUpdate = (dt: number) => {
        // TTL expiry
        if (!this.isDead) {
            let now = performance.now() / 1000;
            let ellapsed = now - this.startTime;
            this.IsDead = this.ttl < ellapsed;
        }
    }
}