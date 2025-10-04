import type { Scene, BehaviorOptions } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';
import { CollisionEnter, type CollisionEnterEvent } from 'dacha/events';

import Health from '../../components/health/health.component.ts';
import * as EventType from '../../events';

@DefineBehavior({
  name: 'StealerHouse',
})
export default class StealerHouse extends Behavior {
  private actor: Actor;
  private scene: Scene;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;

    this.actor.addEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  destroy(): void {
    this.actor.removeEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    console.log(actor, actor.parent instanceof Actor && actor.parent.getComponent(Health));
    if (actor.parent instanceof Actor && actor.parent.getComponent(Health)) {
      actor.parent.dispatchEvent(EventType.Kill);
    }
  };
}
