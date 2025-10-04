import {
  Scene,
  ActorCollection,
  MathOps,
  VectorOps,
  Vector2,
  SceneSystem,
  Transform,
  RigidBody,
} from 'dacha';
import type { SceneSystemOptions, UpdateOptions, ActorEvent } from 'dacha';
import { CollisionEnter, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';
import { DefineSystem } from 'dacha-workbench/decorators';

import * as EventType from '../../events';
import type { MovementEvent } from '../../events';
import Movement from '../../components/movement/movement.component';
import ViewDirection from '../../components/view-direction/view-direction.component';

const JUMP_IMPULSE = -200;
const SPEED_DIVIDER = 0.4;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1;

@DefineSystem({
  name: 'MovementSystem',
})
export default class MovementSystem extends SceneSystem {
  private scene: Scene;
  private actorCollection: ActorCollection;

  constructor(options: SceneSystemOptions) {
    super();

    this.scene = options.scene;
    this.actorCollection = new ActorCollection(options.scene, {
      components: [Movement, Transform],
    });

    this.scene.addEventListener(CollisionEnter, this.handleCollisionEnter);
    this.scene.addEventListener(EventType.MovementJump, this.handleJump);
    this.scene.addEventListener(EventType.Movement, this.handleMovement);
  }

  onSceneDestroy(): void {
    this.scene.removeEventListener(CollisionEnter, this.handleCollisionEnter);
    this.scene.removeEventListener(EventType.MovementJump, this.handleJump);
    this.scene.removeEventListener(EventType.Movement, this.handleMovement);
  }

  private handleMovement = (event: MovementEvent): void => {
    const { target, angle, x, y } = event;

    const movement = target.getComponent(Movement);
    if (!movement) {
      return;
    }

    if (angle !== undefined) {
      movement.direction.multiplyNumber(!movement.isMoving ? 0 : 1);
      movement.direction.add(
        VectorOps.getVectorByAngle(MathOps.degToRad(angle)),
      );
    }
    if (x !== undefined && y !== undefined) {
      const controlIntension = MathOps.getDistanceBetweenTwoPoints(0, x, 0, y);
      const intension =
        controlIntension < SPEED_DIVIDER ? MIN_SPEED : MAX_SPEED;

      movement.direction.x = x * intension;
      movement.direction.y = y * intension;
    }

    movement.direction.multiplyNumber(
      movement.direction.magnitude ? 1 / movement.direction.magnitude : 1,
    );
    movement.isMoving = true;
  };

  private handleJump = (event: ActorEvent): void => {
    const movement = event.target.getComponent(Movement);
    if (!movement || movement.isJumping) {
      return;
    }

    event.target.dispatchEvent(AddImpulse, {
      value: new Vector2(0, JUMP_IMPULSE),
    });
    movement.isJumping = true;
  };

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { mtv, actor, target } = event;

    const movement = target.getComponent(Movement);
    if (movement === undefined) {
      return;
    }

    if (mtv.x === 0 && mtv.y < 0 && !!actor.getComponent(RigidBody)) {
      movement.isJumping = false;
    }
  };

  fixedUpdate(options: UpdateOptions): void {
    if (this.scene.data.isPaused || this.scene.data.isGameOver) {
      return;
    }

    const deltaTimeInSeconds = options.deltaTime / 1000;

    this.actorCollection.forEach((actor) => {
      const movement = actor.getComponent(Movement);
      const { direction, speed, isMoving } = movement;

      if (!isMoving || (direction.x === 0 && direction.y === 0)) {
        return;
      }

      const transform = actor.getComponent(Transform);

      transform.offsetX += direction.x * speed * deltaTimeInSeconds;
      transform.offsetY += direction.y * speed * deltaTimeInSeconds;
    });
  }

  update(): void {
    if (this.scene.data.isPaused || this.scene.data.isGameOver) {
      return;
    }

    this.actorCollection.forEach((actor) => {
      const movement = actor.getComponent(Movement);
      const { direction, isMoving } = movement;

      if (!isMoving || (direction.x === 0 && direction.y === 0)) {
        direction.multiplyNumber(0);
        return;
      }

      const viewDirection = actor.getComponent(ViewDirection);
      if (viewDirection) {
        viewDirection.x = direction.x;
        viewDirection.y = direction.y;
      }

      movement.isMoving = false;
    });
  }
}
