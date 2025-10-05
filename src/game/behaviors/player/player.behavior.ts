import type { BehaviorOptions } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Weapon from '../../components/weapon/weapon.component';

@DefineBehavior({
  name: 'Player',
})
export default class Player extends Behavior {
  private actor: Actor;

  constructor(options: BehaviorOptions) {
    super();

    const { actor } = options;

    this.actor = actor;

    const weapon = this.actor.getComponent(Weapon);
    weapon.attacks.set('blaster', { level: 0, cooldownRemaining: 0 });
  }
}
