import { Actor, Collider, Sprite } from 'dacha';
import type { ActorSpawner, Scene } from 'dacha';

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
    const sprite = shot.getComponent(Sprite);

    shotCollider.radius = stats.radius;
    sprite.width = stats.radius * 2;
    sprite.height = stats.radius * 2;

    this.actor.appendChild(shot);

    this.shot = shot;
    this.isFinished = false;

    this.scene.addEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
    );
  }

  destroy(): void {
    this.scene.removeEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
    );
  }

  private handlePickPlayerPowerUp = (event: PickPlayerPowerUpEvent): void => {
    const { bonus } = event;

    if (bonus.bonus === 'collectorAura') {
      const newStats = ATTACK_STATS_MAP['collectorAura'][bonus.level];
      this.shot.getComponent(Sprite).width = (newStats.radius ?? 0) * 2;
      this.shot.getComponent(Sprite).height = (newStats.radius ?? 0) * 2;
      this.shot.getComponent(Collider).radius = newStats.radius;
    }
  };

  update(): void {
    if (this.isFinished) {
      return;
    }
  }
}
