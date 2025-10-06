import type { BehaviorOptions, Scene } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Weapon from '../../components/weapon/weapon.component';
import * as EventType from '../../events';

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
    weapon.attacks.set('blaster', { level: 0, cooldownRemaining: 0 });

    this.scene.addEventListener(EventType.Pause, this.handlePause);
  }

  handlePause = () => {
    if (!this.scene.data.isGameOver && !this.scene.data.playPowerUpMenuShowed) {
      this.scene.data.isPaused = !this.scene.data.isPaused;
    }
  }
}
