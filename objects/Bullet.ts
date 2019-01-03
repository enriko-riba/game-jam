import * as p2 from "p2";
import { COL_GRP_PLAYER, COL_GRP_BULLET, COL_GRP_SCENE, COL_GRP_GROUND } from '../world/CollisionGroups';
import { wp2 } from '../world/WorldP2';
import { Global } from '..';
import { TextureLoader } from '../_engine';

/**
 * Base for bullets, decals etc.
 */
export class Bullet extends PIXI.Sprite {
    private direction: PIXI.Point = new PIXI.Point();
    private ttl: number;
    private startTime: number;
    private isDead: boolean;
    private onDeath: () => void;

    public readonly interactionType: number = 666;
    public body: p2.Body;

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
    }

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

    public onUpdate = () => {
        // TTL expiry
        if (!this.isDead) {
            let now = performance.now() / 1000;
            let ellapsed = now - this.startTime;
            this.IsDead = this.ttl < ellapsed;
        }
    }

    private static bullets: Bullet[] = [];
    public static emitBullet = (textureName: string, position: PIXI.Point, target:any, damage: number): Bullet => {
        let bullet = Bullet.findDeadBullet();
        if (!bullet) {

            //  create new bullet
            var t = TextureLoader.Get(textureName);
            bullet = new Bullet(t, 200, 5, damage);
            bullet.anchor.set(0.5);
            bullet.scale.set(0.5);
            Bullet.bullets.push(bullet);
            Global.worldContainer.addChild(bullet);

            //-----------------------------
            //  create body (sensor shape)
            //-----------------------------
            let shape = new p2.Circle({ radius: bullet.width / 2 });
            shape.collisionGroup = COL_GRP_BULLET;
            shape.collisionMask = COL_GRP_PLAYER | COL_GRP_SCENE | COL_GRP_GROUND;
            shape.sensor = true;
            var options: p2.BodyOptions = {
                mass: 0,
                position: [position.x, position.y],
                angle: 0,
                fixedRotation: false,
                angularDamping: 0,
                damping: 0
            } as p2.BodyOptions;
            let body = new p2.Body(options);
            body.addShape(shape);
            body.setDensity(0.0);
            body.gravityScale = 0;
            body.angularVelocity = 2;
            body.collisionResponse = false;
            body.type = p2.Body.DYNAMIC;
            (body as any).DisplayObject = bullet;
            bullet.body = body;
            wp2.addBody(body);
        } 

        bullet.position = position;
        let pt = (target instanceof Float32Array) ? new PIXI.Point(target[0] - position.x, target[1] - position.y) : new PIXI.Point(target.x - position.x, target.y - position.y);
        bullet.Direction = pt;
        bullet.damage = damage;
        bullet.IsDead = false;
        bullet.body.velocity[0] = bullet.Direction.x * bullet.velocity;
        bullet.body.velocity[1] = bullet.Direction.y * bullet.velocity;

        return bullet;
    };

    public static reset(){
        Bullet.bullets = [];
    }

    private static findDeadBullet = (): Bullet => {
        for (var i = 0, len = Bullet.bullets.length; i < len; i++) {
            let blt = Bullet.bullets[i];
            if (blt.IsDead) {
                return blt;
            }
        }
        return null;
    };
}