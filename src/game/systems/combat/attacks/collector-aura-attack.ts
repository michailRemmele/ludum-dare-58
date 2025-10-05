import { Actor, Collider, Shape } from 'dacha';
import type { ActorSpawner, Scene } from 'dacha';
import { CollisionEnter } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import { type AttackStats, ATTACK_STATS_MAP } from '../../../../consts/game';
import * as EventType from '../../../events';
import type { PickPlayerPowerUpEvent } from '../../../events';

import type { Attack } from './attack';

interface CollectorAuraAttackStats extends AttackStats {
  radius: number;
  projectileModel: string;
}

interface CollectorAuraAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: CollectorAuraAttackStats;
}

export class CollectorAuraAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private shot: Actor;

  isFinished: boolean;

  constructor({ actor, spawner, scene, stats }: CollectorAuraAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotCollider = shot.getComponent(Collider);
    const shape = shot.getComponent(Shape);

    shotCollider.radius = stats.radius;
    shape.radius = stats.radius;

    this.actor.appendChild(shot);

    this.shot = shot;
    this.isFinished = false;

    this.shot.addEventListener(CollisionEnter, this.handleCollisionEnter);

    this.scene.addEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
    );
  }

  destroy(): void {
    this.shot.removeEventListener(CollisionEnter, this.handleCollisionEnter);

    this.scene.removeEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
    );
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    console.log('Collsion', actor);
  };

  private handlePickPlayerPowerUp = (event: PickPlayerPowerUpEvent): void => {
    const { bonus } = event;

    if (bonus.bonus === 'collectorAura') {
      const newStats = ATTACK_STATS_MAP['collectorAura'][bonus.level];
      console.log(newStats);
    }
  };

  update(): void {
    if (this.isFinished) {
      return;
    }
  }
}
