import type { BehaviorOptions, UpdateOptions } from 'dacha';
import { Actor, Behavior, Sprite } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import * as EventType from '../../events';
import Frost from '../../components/frost/frost.component';
import Movement from '../../components/movement/movement.component';

@DefineBehavior({
  name: 'FrostMod',
})
export default class FrostMod extends Behavior {
  private actor: Actor;

  constructor(options: BehaviorOptions) {
    super();

    const { actor } = options;

    this.actor = actor;

    const frost = this.actor.getComponent(Frost);

    const target = this.actor.parent as Actor;

    const movement = target.getComponent(Movement);
    if (!movement) {
      return;
    }

    movement.speed = movement.maxSpeed * frost.slowFactor;

    frost.durationRemaining = frost.duration;
  }

  destroy(): void {
    const target = this.actor.parent as Actor | undefined;

    const sprite = target?.getComponent(Sprite);
    if (sprite) {
      sprite.color = '#fff';
    }

    const movement = target?.getComponent(Movement);
    if (!movement) {
      return;
    }

    movement.speed = movement.maxSpeed;
  }

  update(options: UpdateOptions): void {
    const frost = this.actor.getComponent(Frost);

    const target = this.actor.parent as Actor | undefined;
    const sprite = target?.getComponent(Sprite);
    if (sprite) {
      sprite.color = '#5380FF';
    }

    frost.durationRemaining -= options.deltaTime;

    if (frost.durationRemaining <= 0) {
      this.actor.dispatchEvent(EventType.Kill);
    }
  }
}
