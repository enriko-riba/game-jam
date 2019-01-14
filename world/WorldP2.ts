import * as p2 from "p2";
import { Global } from '..';
import {Dictionary} from '..';
import { COL_GRP_GROUND, COL_GRP_SCENE, COL_GRP_NPC, COL_GRP_PLAYER, COL_GRP_BULLET } from './CollisionGroups';

/**
 * Tuple of two physics bodies touching or penetrating each other.
 */
export class ContactPair {
    constructor(public BodyA: p2.Body, public BodyB: p2.Body) { }
}


/**
 * Takes care of the physics simulations.
 */
export class WorldP2 {

    public playerBody: p2.Body;
    private world: p2.World;
    private ground: p2.Body;
    private materials: Dictionary<p2.Material>;
    private contactPairs: Array<ContactPair> = [];
    private contactWatch: Array<number> = [];

    /**
     * We hold all player contacts separate (due to heavy usage).
     */
    private playerBodyContacts: Array<p2.Body> = [];

    private readonly fixedTimeStep = 1 / 60; // seconds


    constructor() {
        this.world = new p2.World({
            gravity: [0, -1500],
        });

        this.setupMaterials();

        //------------------------------------------
        // create an infinite ground plane body
        //------------------------------------------
        this.ground = new p2.Body({
            mass: 0,
        });
        var shape = new p2.Plane();
        shape.material = this.materials.get("ground_default");
        shape.collisionGroup = COL_GRP_GROUND;
        shape.collisionMask = COL_GRP_SCENE | COL_GRP_NPC | COL_GRP_PLAYER | COL_GRP_BULLET;
        this.ground.addShape(shape);
        this.world.addBody(this.ground);

        //------------------------------------------
        //  player body
        //------------------------------------------
        this.playerBody = new p2.Body({
            mass: 42,
            fixedRotation: true,            
        });
        this.playerBody.damping = 0.001;
        shape = new p2.Circle({
            radius: 24,
        });
        shape.collisionGroup = COL_GRP_PLAYER;
        shape.collisionMask = COL_GRP_GROUND | COL_GRP_SCENE | COL_GRP_NPC | COL_GRP_BULLET;
        shape.material = this.materials.get("player");
        this.playerBody.addShape(shape);
        this.world.addBody(this.playerBody);

        //------------------------------------------
        //  settings
        //------------------------------------------
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        this.world.on("beginContact", this.beginContact, this);
        this.world.on("endContact", this.endContact, this);
    }

    /**
     * Removes all bodies except the player body and ground plane.
     */
    public clearLevel() {
        var bodies = this.world.bodies;
        for (var i = bodies.length-1; i >=0; i--) {
            let b = bodies[i];
            if (b !== this.playerBody && b !== this.ground) {
                this.world.removeBody(b);
            }
        }       
    }

    /**
     * Returns the world bodies.
     */
    public get bodies(): Array<p2.Body> {
        return this.world.bodies;
    }

    /**
     * Adds an event handler to the p2 world object.
     * @param eventName
     * @param handler
     */
    public on(eventName: string, handler: any, context?: any): void {
        context = context || this;
        this.world.on(eventName, handler, context);
    }

    /**
     * advances the physics simulation for the given dt time
     * @param dt the time in seconds since the last simulation step
     */
    public update(dt: number): void {
        this.world.step(this.fixedTimeStep, dt/1000);
        Global.position.x = this.playerBody.interpolatedPosition[0];
        Global.position.y = this.playerBody.interpolatedPosition[1];
    }

    /**
     * Removes the body from world.
     * @param body
     */
    public removeBody(body: p2.Body): void {
        this.world.removeBody(body);
    }

    /**
     * adds an object to the p2 world
     * @param body
     */
    public addBody(body: p2.Body): void {
        // HACK: loader specific implementation stores the material name in shape.materialName
        if (body.shapes && body.shapes.length > 0) {
            for (var i = 0, len = body.shapes.length; i < len; i++) {
                let shape: any = body.shapes[i];
                if (shape.materialName && !shape.material) {
                    shape.material = this.materials.get(shape.materialName);
                }
            }            
        }
        this.world.addBody(body);
    }

    /**
     * Clears all saved contacts (from contactPairs) for the given body.
     * @param body
     */
    public clearContactsForBody(body: p2.Body):void {
        if (body === this.playerBody) {
            this.playerBodyContacts = [];
            return;
        }

        var foundIdx: number = 0;
        while (foundIdx > -1) {
            foundIdx = -1;
            for (var i = 0; i < this.contactPairs.length; i++) {
                let cp:ContactPair = this.contactPairs[i];
                if (cp.BodyA === body || cp.BodyB === body)  {
                    foundIdx = i;
                    break;
                }
            }

            if (foundIdx >= 0) {
                this.contactPairs.splice(foundIdx, 1);
            }
        }
    }

    /**
     * returns all contact pairs for the given body.
     * Note: the body must be in the contact watch list or an empty array will be returned.
     * @param body
     */
    public getContactsForBody(body: p2.Body): Array<ContactPair> {
        var foundPairs: Array<ContactPair> = [];
        for (var i = 0, len = this.contactPairs.length; i < len; i++) {
            let cp: ContactPair = this.contactPairs[i];        
            if (cp.BodyA === body || cp.BodyB === body) {
                foundPairs.push(cp);
            }
        };
        return foundPairs;
    }

    /**
     * Adds the body to the contact watch list.
     * Only bodies in this list can be retrieved via the getContactsForBody() function.
     * @param body
     */
    public addContactWatch(body: p2.Body): void {
        this.contactWatch.push(body.id);
    }

    /**
     * Returns all bodies the player has contact with.
     */
    public get playerContacts(): p2.Body[]{
        return this.playerBodyContacts;
    }

    private beginContact = (evt: any) => {
        
        let bullet: p2.Body = null;
        let other: p2.Body = null;
        if (evt.bodyA.shapes[0].collisionGroup === COL_GRP_BULLET) {
            bullet = evt.bodyA;
            other = evt.bodyB;
        } else if (evt.bodyB.shapes[0].collisionGroup === COL_GRP_BULLET){
            bullet = evt.bodyB;
            other = evt.bodyA;
        }
        if (bullet) {
           // console.log("emitting bulettContact, body.id: " + bullet.id);
            this.world.emit({ type: "bulletContact", playerHit: other === this.playerBody, bulletBody: bullet, otherBody: other });
            return;
        }

        //  check for player contacts (but only with dynamic bodies)
        if (this.playerBody === evt.bodyA) {
            this.playerBodyContacts.push(evt.bodyB);
            this.world.emit({ type: "playerContact", velocity: this.playerBody.velocity, body: evt.bodyB });
            return;
        } else if (this.playerBody === evt.bodyB) {
            this.playerBodyContacts.push(evt.bodyA);
            this.world.emit({ type: "playerContact", velocity: this.playerBody.velocity, body: evt.bodyA });
            return;
        }

        //  check for watched bodies and store pairs if match
        var watchedItemFound = this.contactWatch.filter((bodyId) => {
            return (bodyId === evt.bodyA.id || bodyId === evt.bodyB.id);
        });
        if (watchedItemFound && watchedItemFound.length > 0) {
            let cp: ContactPair = new ContactPair(evt.bodyA, evt.bodyB);
            this.contactPairs.push(cp);
        }
        
    };

    private endContact = (evt: any) => {
        //  no need to update player contacts or contact pairs for bullets
        let isBulletConntact = evt.bodyA.shapes[0].collisionGroup === COL_GRP_BULLET || evt.bodyB.shapes[0].collisionGroup === COL_GRP_BULLET;
        if (isBulletConntact) return;

        //  if it is a player contact remove the foreign body from the playerBodyContacts list
        if (this.playerBody === evt.bodyA ) {
            var bodyIDX = this.playerBodyContacts.indexOf(evt.bodyB);
            this.playerBodyContacts.splice(bodyIDX, 1);
            this.world.emit({ type: "playerContactEnd", velocity: this.playerBody.velocity, body: evt.bodyB });
            //console.log("endContact",evt.bodyB);
            return;
        } else if (this.playerBody === evt.bodyB) {
            var bodyIDX = this.playerBodyContacts.indexOf(evt.bodyB);
            this.playerBodyContacts.splice(bodyIDX, 1);
            this.world.emit({ type: "playerContactEnd", velocity: this.playerBody.velocity, body: evt.bodyA });
            //console.log("endContact", evt.bodyA);
            return;
        }


        //console.log("endContact: ", evt);
        var foundIdx: number = -1;
        for (var i = 0; i < this.contactPairs.length; i++) {
            let cp: ContactPair = this.contactPairs[i];
            if (
                (cp.BodyA === evt.bodyA && cp.BodyB === evt.bodyB) ||
                (cp.BodyA === evt.bodyB && cp.BodyB === evt.bodyA)) {
                foundIdx = i;
                break;
            }
        }

        if (foundIdx >= 0) {
            this.contactPairs.splice(foundIdx, 1);
        }
    };

    private setupMaterials(): void {
        this.materials = new Dictionary<p2.Material>();
        this.materials.set("player", new p2.Material(p2.Material.idCounter++));
        this.materials.set("ground_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("box_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("box_highfriction", new p2.Material(p2.Material.idCounter++));
        this.materials.set("mob_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("bumper", new p2.Material(p2.Material.idCounter++));


        var playerGroundContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("ground_default"),
            {
                friction: 0.85,
                restitution: 0.1,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity:0
            });
        this.world.addContactMaterial(playerGroundContactMaterial);

        var playerMobContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("mob_default"),
            {
                friction: 0.1,
                restitution: 0.4,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerMobContactMaterial);


        var playerBoxContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("box_default"),
            {
                friction: 0.20,
                restitution: 0.25,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerBoxContactMaterial);

        var playerBoxHighFirctContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("box_highfriction"),
            {
                friction: 0.70,
                restitution: 0.20,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerBoxHighFirctContactMaterial);

        var playerBumperContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("bumper"),
            {
                friction: 0.35,
                restitution: 0.75,
                stiffness: Number.MAX_VALUE,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: Number.MAX_VALUE,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerBumperContactMaterial);

        var boxGroundContactMaterial = new p2.ContactMaterial(
            this.materials.get("box_default"),
            this.materials.get("ground_default"),
            {
                friction: 0.8,
                restitution: 0.3,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(boxGroundContactMaterial);
    }
}

export var wp2 = new WorldP2();