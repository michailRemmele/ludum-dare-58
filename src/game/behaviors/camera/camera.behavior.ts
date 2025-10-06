import type { Actor, Scene, BehaviorOptions, UpdateOptions } from 'dacha';
import { Behavior, Camera, Transform } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import { PLAYER_ACTOR_NAME } from '../../../consts/actors';

import { smoothMove } from './utils';

const VIEWPORT_SIZE = 256;

@DefineBehavior({
  name: 'CameraBehavior',
})
export default class CameraBehavior extends Behavior {
  private actor: Actor;
  private scene: Scene;

  constructor(options: BehaviorOptions) {
    super();

    this.actor = options.actor;
    this.scene = options.scene;
  }

  private updateZoom(): void {
    const camera = this.actor.getComponent(Camera);
    camera.zoom = Math.round(camera.windowSizeY / VIEWPORT_SIZE);
  }

  update(options: UpdateOptions): void {
    this.updateZoom();

    const transform = this.actor.getComponent(Transform);
    const target = this.scene.findChildByName(PLAYER_ACTOR_NAME);

    if (!target) {
      return;
    }

    const targetTransform = target.getComponent(Transform);

    const [x, y] = smoothMove(
      transform.offsetX,
      transform.offsetY,
      targetTransform.offsetX,
      targetTransform.offsetY,
      options.deltaTime,
    );

    transform.offsetX = x;
    transform.offsetY = y;
  }
}
