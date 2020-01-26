import { KeyboardMapper } from '..';
import { WorldP2 } from '../world/WorldP2';
import { stats } from './PlayerStats';
import { eventEmitter, MOVE_TOPIC } from '../events';
import { StatType } from '../enums';

export class MovementController {
    private readonly VELOCITY = 150;
    private readonly JUMP_FORCE = 17000;
    private readonly JUMP_ATTACK_FORCE = -17000;

    private readonly JUMP_COOLDOWN = 500;
    private readonly JUMP_ATTACK_COOLDOWN = 1000;
    private readonly JUMP_ATTACK_FREEZE = 800;


    private nextJumpAllowed: number = 0;
    private nextJumpDownAllowed: number = 0;

    private world: WorldP2;
    private movementState: MovementState = -1;
    private kbd = new KeyboardMapper();

    private isRunning = false;
    private isJumping = false;
    private newState: MovementState = MovementState.Idle;

    private _isInteractive: boolean = true;
    
    constructor(world: WorldP2) {
        this.world = world;
    }

    /**
     * Returns if the player can interact via controls.
     */
    public get isInteractive(): boolean {
        return this._isInteractive;
    }

    /**
     * Sets if the player can interact via controls.
     */
    public set isInteractive(newValue: boolean) {
        this._isInteractive = newValue;
        if (!this._isInteractive) {
            this.isRunning = false;
            this.movementState = MovementState.Idle;
        }
    }

    public get IsJumping(): boolean {
        return this.isJumping;
    }

    public get CanJump(): boolean {
        return !this.isJumping && this.nextJumpAllowed < performance.now();
    }

    public get IsRunning(): boolean {
        return this.isRunning;
    }

    public get MovementState(): MovementState {
        return this.movementState;
    }

    public StartJump(direction: MovementState.JumpLeft | MovementState.JumpRight | MovementState.JumpUp): void {
        var forceVector: [number, number];

        if (direction === MovementState.JumpUp) {
            forceVector = [0, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpLeft) {
            forceVector = [-this.JUMP_FORCE * 0.10, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE * 0.10, this.JUMP_FORCE];
        }
        this.world.playerBody.applyImpulse(forceVector);
        this.world.clearContactsForBody(this.world.playerBody);
        this.nextJumpAllowed = performance.now() + this.JUMP_COOLDOWN;
    }

    public StartJumpDown(): void {
        switch (this.movementState) {
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.newState = MovementState.JumpDownLeft;
                break;

            case MovementState.Right:
            case MovementState.JumpRight:
                this.newState = MovementState.JumpDownRight;
                break;

            default:
                this.newState = MovementState.JumpDown;
                break;
        }
        console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);
        
        var forceVector: [number, number] = [0, this.JUMP_ATTACK_FORCE];
        this.world.playerBody.setZeroForce();
        this.world.playerBody.applyImpulse(forceVector);
        this.nextJumpDownAllowed = performance.now() + this.JUMP_ATTACK_COOLDOWN;
        
        this.isInteractive = false;
        setTimeout(() => this.isInteractive = true, this.JUMP_ATTACK_FREEZE);
        
        eventEmitter.emit(MOVE_TOPIC, {
            newState: this.newState,
            oldState: this.movementState,
            isJumping: true,
            isRunning: false // makes no difference during jumps
        });
        this.movementState = this.newState;
    }

    public update(dt: number): void {

        const KEY_A: number = 65;
        const KEY_D: number = 68;
        const KEY_W: number = 87;
        const KEY_S: number = 83;

        const KEY_SHIFT: number = 16;
        const KEY_LEFT: number = 37;
        const KEY_RIGHT: number = 39;
        const KEY_UP: number = 38;
        const KEY_DOWN: number = 40;
        const SPACE: number = 32;

        this.newState = MovementState.Idle;

        var isMovingVerticaly = Math.abs(this.world.playerBody.velocity[1]) > 0.01;
        if (isMovingVerticaly) {
            let hasOnlySensorContacts = this.world.playerContacts.every((body) => body.shapes[0].sensor);
            this.isJumping = hasOnlySensorContacts;
        } else {
            this.isJumping = false;
        }

        //  calculate the horizontal velocity
        var v: number = this.calcMovementVelocity();

        //  no movement (except jump down) while jumping
        if (this.isJumping && this._isInteractive) {
            if ((this.kbd.isKeyDown(KEY_S) || this.kbd.isKeyDown(KEY_DOWN)) && stats.HasJumpAtack && this.nextJumpDownAllowed < performance.now()) {
                this.StartJumpDown();
            }
            this.world.playerBody.velocity[0] += v;
            return;

        } else {
            //  calculate the horizontal velocity
            this.world.playerBody.velocity[0] = v;
        }


        var canRun = stats.getStat(StatType.Dust) > 1;
        var newIsRunning: boolean = this.kbd.isKeyDown(KEY_SHIFT) && canRun && this._isInteractive;

        if (this.kbd.isKeyDown(KEY_A) || this.kbd.isKeyDown(KEY_LEFT) ) {
            this.newState = MovementState.Left;
        } else if (this.kbd.isKeyDown(KEY_D) || this.kbd.isKeyDown(KEY_RIGHT)) {
            this.newState = MovementState.Right;
        }

        //  check if jump is pressed
        if ((this.kbd.isKeyDown(KEY_W) || this.kbd.isKeyDown(KEY_UP) || this.kbd.isKeyDown(SPACE)) && this.CanJump) {
            if (this.movementState === MovementState.Left) {
                this.newState = MovementState.JumpLeft;
            } else if (this.movementState === MovementState.Right) {
                this.newState = MovementState.JumpRight;
            } else if (this.movementState === MovementState.Idle) {
                this.newState = MovementState.JumpUp;
                newIsRunning = false;
            }
        }

        //  has state changed
        if (this.newState !== this.movementState || newIsRunning !== this.IsRunning) {
            var isCurrentJumping = false;
            switch (this.newState) {
                case MovementState.JumpLeft:
                    this.StartJump(MovementState.JumpLeft);
                    isCurrentJumping = true;
                    break;
                case MovementState.JumpRight:
                    this.StartJump(MovementState.JumpRight);
                    isCurrentJumping = true;
                    break;
                case MovementState.JumpUp:
                    this.StartJump(MovementState.JumpUp);
                    isCurrentJumping = true;
                    break;
            }
            eventEmitter.emit(MOVE_TOPIC, {
                newState: this.newState,
                oldState: this.movementState,
                isJumping: isCurrentJumping,
                isRunning: newIsRunning 
            });
        }

        //  update new states
        this.movementState = this.newState;
        this.isRunning = newIsRunning;
    }

    private calcMovementVelocity(): number {
        var direction: number = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            direction = -1;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            direction = 1;
        }

        if (this.IsJumping) {
            //  allow for some minimal horizontal movement (this is to prevent getting stuck in air if between two bodies with friction and no contacts)
            return direction * 0.2;
        } else {
            var velocity: number = direction * this.VELOCITY * (this.IsRunning ? 2 : 1.0);
            return velocity;
        }
    }
}

export enum MovementState {
    Left,
    Right,
    Idle,

    JumpLeft,
    JumpRight,
    JumpUp,

    JumpDownLeft,
    JumpDownRight,
    JumpDown,
}