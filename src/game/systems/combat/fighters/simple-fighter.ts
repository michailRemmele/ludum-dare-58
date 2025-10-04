import type { Actor, ActorSpawner, Scene } from 'dacha';
import {
  CollisionEnter,
  CollisionLeave,
  type CollisionEnterEvent,
  type CollisionLeaveEvent,
} from 'dacha/events';

import { attacks as attackTypes } from '../attacks';
import Weapon from '../../../components/weapon/weapon.component';
import type { Attack } from '../attacks';
import { ATTACK_STATS_MAP } from '../attack-stats-map';
import { findTeam } from '../utils/find-team';

import type { Fighter } from './fighter';

export class SimpleFighter implements Fighter {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private weapon: Weapon;

  private activeAttacks: Attack[];
  private enemies: Set<Actor>;

  constructor(actor: Actor, spawner: ActorSpawner, scene: Scene) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;

    this.weapon = this.actor.getComponent(Weapon);

    this.activeAttacks = [];
    this.enemies = new Set();

    this.actor.addEventListener(CollisionEnter, this.handleCollisionEnter);
    this.actor.addEventListener(CollisionLeave, this.handleCollisionLeave);
  }

  destroy(): void {
    this.actor.removeEventListener(CollisionEnter, this.handleCollisionEnter);
    this.actor.removeEventListener(CollisionLeave, this.handleCollisionLeave);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    const actorTeam = findTeam(actor);
    const fighterTeam = findTeam(this.actor);

    if (!actorTeam || !fighterTeam) {
      return;
    }

    if (actorTeam.index !== fighterTeam.index) {
      this.enemies.add(actor);
    }
  };

  private handleCollisionLeave = (event: CollisionLeaveEvent): void => {
    const { actor } = event;

    this.enemies.delete(actor);
  };

  private attack(type: string): Attack | undefined {
    if (this.enemies.size === 0) {
      return;
    }

    const { attacks } = this.weapon;

    const attackState = attacks.get(type)!;
    const Attack = attackTypes[type];

    if (!Attack) {
      throw new Error(`Not found attack with same type: ${type}`);
    }

    const stats = ATTACK_STATS_MAP[type][attackState.level];

    const attack = new Attack({
      actor: this.actor,
      spawner: this.spawner,
      scene: this.scene,
      stats,
      enemies: Array.from(this.enemies),
    });

    attackState.cooldownRemaining = stats.cooldown;

    return attack;
  }

  update(deltaTime: number): void {
    const { attacks } = this.weapon;

    attacks.forEach((attackState, attackType) => {
      attackState.cooldownRemaining -= deltaTime;

      if (attackState.cooldownRemaining <= 0) {
        const attack = this.attack(attackType);
        if (attack) {
          this.activeAttacks.push(attack);
        }
      }
    });

    this.activeAttacks = this.activeAttacks.filter((activeAttack) => {
      activeAttack.update(deltaTime);

      if (activeAttack.isFinished) {
        activeAttack.destroy();
      }
      return !activeAttack.isFinished;
    });
  }
}
