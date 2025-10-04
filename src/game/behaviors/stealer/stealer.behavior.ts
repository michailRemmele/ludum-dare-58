import type { BehaviorOptions } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';
import { CollisionEnter, type CollisionEnterEvent } from 'dacha/events';

import Storage from '../../components/storage/storage.component';
import Pocket from '../../components/pocket/pocket.component';
import * as EventType from '../../events';

@DefineBehavior({
  name: 'Stealer',
})
export default class Stealer extends Behavior {
  private actor: Actor;

  constructor(options: BehaviorOptions) {
    super();

    const { actor } = options;

    this.actor = actor;

    this.actor.addEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  destroy(): void {
    this.actor.removeEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    if (!actor.getComponent(Storage)) {
      return;
    }

    const storage = actor.getComponent(Storage);
    const pocket = this.actor.getComponent(Pocket);

    if (pocket.amount > 0) {
      return;
    }

    const amount = Math.min(storage.amount, pocket.size);

    pocket.amount = amount;

    actor.dispatchEvent(EventType.StealMoney, {
      value: amount,
      actor: this.actor,
    });
  };
}
