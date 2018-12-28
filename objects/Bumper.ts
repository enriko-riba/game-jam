const TEXTURE_BUMPER = "assets/img/objects/bumper_01.png";
const TEXTURE_ROTOR = "assets/img/objects/bumper_rotor_01.png";
const ROTATION = Math.PI / 8;

export class Bumper extends PIXI.Sprite {
    private rotor: PIXI.Sprite;

    constructor() {
        super(PIXI.loader.resources[TEXTURE_BUMPER].texture);
        this.rotor = new PIXI.Sprite(PIXI.loader.resources[TEXTURE_ROTOR].texture);
        this.rotor.anchor.set(0.5);
        this.rotor.pivot.set(0.5);
        this.addChild(this.rotor);
        this.anchor.set(0.5);
    }

    public onUpdate = (dt: number) => {
        var rot = this.rotor.rotation - (ROTATION * dt / 1000);
        this.rotor.rotation = rot % Math.PI;
    };
}