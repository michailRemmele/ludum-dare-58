import type { BehaviorOptions, UpdateOptions } from 'dacha';
import { Actor, Behavior, Sprite } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import * as EventType from '../../events';
import Poison from '../../components/poison/poison.component';
import { PLAYER_ACTOR_NAME } from '../../../consts/actors';

@DefineBehavior({
  name: 'PoisonMod',
})
export default class PoisonMod extends Behavior {
  private actor: Actor;
  private player: Actor;

  private damage: number;
  private frequency: number;

  private cooldown: number;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.player = scene.findChildByName(PLAYER_ACTOR_NAME)!;

    const poison = this.actor.getComponent(Poison);

    this.damage = poison.damage;
    this.frequency = poison.frequency;

    this.cooldown = 0;

    poison.durationRemaining = poison.duration;
  }

  destroy(): void {
    const target = this.actor.parent as Actor | undefined; 

    const sprite = target?.getComponent(Sprite);
    if (sprite) {
      sprite.color = '#fff';
    }
  }

  update(options: UpdateOptions): void {
    const poison = this.actor.getComponent(Poison);

    const target = this.actor.parent as Actor | undefined;
    const sprite = target?.getComponent(Sprite);
    if (sprite) {
      sprite.color = '#2efe2a';
    }

    this.cooldown -= options.deltaTime;

    if (this.cooldown <= 0) {
      target?.dispatchEvent(EventType.Damage, {
        value: this.damage,
        actor: this.player,
      });

      this.cooldown = this.frequency;
    }

    poison.durationRemaining -= options.deltaTime;

    if (poison.durationRemaining <= 0) {
      this.actor.dispatchEvent(EventType.Kill);
    }
  }
}
