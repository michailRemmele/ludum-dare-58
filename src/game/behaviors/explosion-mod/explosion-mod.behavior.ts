import type { BehaviorOptions, UpdateOptions } from 'dacha';
import { Actor, Behavior, Sprite, Collider } from 'dacha';
import { CollisionEnter, type CollisionEnterEvent } from 'dacha/events';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Explosion from '../../components/explosion/explosion.component';
import HitBox from '../../components/hit-box/hit-box.component';
import Team from '../../components/team/team.component';
import * as EventType from '../../events';
import { PLAYER_ACTOR_NAME } from '../../../consts/actors';
import { findTeam } from '../../systems/combat/utils/find-team';

const EXPLOSION_LIFETIME = 100;

@DefineBehavior({
  name: 'ExplosionMod',
})
export default class ExplosionMod extends Behavior {
  private actor: Actor;
  private player: Actor;

  private damage: number;
  private lifetime: number;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.player = scene.findChildByName(PLAYER_ACTOR_NAME)!;

    const explosion = this.actor.getComponent(Explosion);
    const collider = this.actor.getComponent(Collider);
    const sprite = this.actor.getComponent(Sprite);

    collider.radius = explosion.radius;

    sprite.width = explosion.radius * 2;
    sprite.height = explosion.radius * 2;

    this.damage = explosion.damage;
    this.lifetime = EXPLOSION_LIFETIME;

    this.actor.addEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  destroy(): void {
    this.actor.removeEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    const team = this.actor.getComponent(Team);

    const hitBox = actor.getComponent(HitBox);
    const targetTeam = findTeam(actor);
    const target = actor.parent;

    if (team && targetTeam && team?.index === targetTeam?.index) {
      return;
    }

    if (!hitBox || !target || !(target instanceof Actor)) {
      return;
    }

    target.dispatchEvent(EventType.Damage, {
      value: this.damage,
      actor: this.player,
      damageType: 'explosion',
    });
  };

  update(options: UpdateOptions): void {
    this.lifetime -= options.deltaTime;

    if (this.lifetime <= 0) {
      this.actor.dispatchEvent(EventType.Kill);
    }
  }
}
