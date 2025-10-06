import type { Actor, ActorSpawner, Scene } from 'dacha';
import { Transform } from 'dacha';
import {
  CollisionEnter,
  CollisionLeave,
  type CollisionEnterEvent,
  type CollisionLeaveEvent,
} from 'dacha/events';

import { attacks as attackTypes } from '../attacks';
import Weapon from '../../../components/weapon/weapon.component';
import Poison from '../../../components/poison/poison.component';
import Frost from '../../../components/frost/frost.component';
import Explosion from '../../../components/explosion/explosion.component';
import type { Attack } from '../attacks';
import { ATTACK_STATS_MAP } from '../../../../consts/game';
import { findTeam } from '../utils/find-team';
import {
  POISON_MOD_ID,
  FROST_MOD_ID,
  EXPLOSION_MOD_ID,
} from '../../../../consts/templates';
import type {
  AttackDamageFn,
  AttackDestroyFn,
  FrostOptions,
  PoisonOptions,
} from '../types';
import * as EventType from '../../../events';

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

  private applyFrost(target: Actor, frostOptions: FrostOptions): void {
    const oldFrostActor = target.findChild(
      (child) => !!child.getComponent(Frost),
    );
    if (oldFrostActor) {
      const oldFrost = oldFrostActor.getComponent(Frost);
      if (
        frostOptions.slowFactor > oldFrost.slowFactor ||
        (frostOptions.slowFactor === oldFrost.slowFactor &&
          frostOptions.duration > oldFrost.durationRemaining)
      ) {
        oldFrostActor.remove();
      } else {
        return;
      }
    }

    const frostActor = this.spawner.spawn(FROST_MOD_ID);
    const frost = frostActor.getComponent(Frost);
    frost.duration = frostOptions.duration;
    frost.slowFactor = frostOptions.slowFactor;

    target.appendChild(frostActor);
  }

  private applyPoison(target: Actor, poisonOptions: PoisonOptions): void {
    const oldPoisonActor = target.findChild(
      (child) => !!child.getComponent(Poison),
    );
    if (oldPoisonActor) {
      const oldPoison = oldPoisonActor.getComponent(Poison);
      if (
        poisonOptions.damage > oldPoison.damage ||
        (poisonOptions.damage === oldPoison.damage &&
          poisonOptions.duration > oldPoison.durationRemaining)
      ) {
        oldPoisonActor.remove();
      } else {
        return;
      }
    }

    const poisonActor = this.spawner.spawn(POISON_MOD_ID);
    const poison = poisonActor.getComponent(Poison);
    poison.damage = poisonOptions.damage;
    poison.duration = poisonOptions.duration;
    poison.frequency = poisonOptions.frequency;

    target.appendChild(poisonActor);
  }

  private handleAttackDamage: AttackDamageFn = (
    target,
    frostOptions,
    poisonOptions,
  ): void => {
    if (frostOptions) {
      this.applyFrost(target, frostOptions);
    }
    if (poisonOptions) {
      this.applyPoison(target, poisonOptions);
    }
  };

  private handleAttackDestroy: AttackDestroyFn = (
    actor,
    explosionOptions,
  ): void => {
    if (!explosionOptions) {
      return;
    }

    const transform = actor.getComponent(Transform);

    const explosionActor = this.spawner.spawn(EXPLOSION_MOD_ID);
    const explosionTransform = explosionActor.getComponent(Transform);
    explosionTransform.offsetX = transform.offsetX;
    explosionTransform.offsetY = transform.offsetY;

    const explosion = explosionActor.getComponent(Explosion);
    explosion.radius = explosionOptions.radius;
    explosion.damage = explosionOptions.damage;

    this.scene.appendChild(explosionActor);
  };

  private attack(type: string): Attack | undefined {
    if (this.enemies.size === 0) {
      return;
    }

    const { attacks, mods } = this.weapon;

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
      mods: mods.get(type),
      enemies: Array.from(this.enemies),
      onDamage: this.handleAttackDamage,
      onDestroy: this.handleAttackDestroy,
    });

    attackState.cooldownRemaining = stats.cooldown;

    return attack;
  }

  update(deltaTime: number): void {
    const { attacks } = this.weapon;

    if (!this.scene.data.isPaused && !this.scene.data.isGameOver) {
      attacks.forEach((attackState, attackType) => {
        attackState.cooldownRemaining -= deltaTime;

        if (attackState.cooldownRemaining <= 0) {
          const attack = this.attack(attackType);
          if (attack) {
            this.activeAttacks.push(attack);

            this.scene.dispatchEvent(EventType.PlayerAttack);
          }
        }
      });
    }

    this.activeAttacks = this.activeAttacks.filter((activeAttack) => {
      activeAttack.update(deltaTime);

      if (activeAttack.isFinished) {
        activeAttack.destroy();
      }
      return !activeAttack.isFinished;
    });
  }
}
