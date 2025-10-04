import type { Scene, BehaviorOptions } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Weapon from '../../components/weapon/weapon.component';

@DefineBehavior({
  name: 'Player',
})
export default class Player extends Behavior {
  private actor: Actor;
  private scene: Scene;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;

    const weapon = this.actor.getComponent(Weapon);
    weapon.attacks.set('baseRange', { level: 0, cooldownRemaining: 0 });
  }
}
