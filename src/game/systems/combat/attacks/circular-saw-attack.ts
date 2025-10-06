import { Actor, MathOps, VectorOps, Transform, Collider, Sprite } from 'dacha';
import type { ActorSpawner, Scene, Vector2 } from 'dacha';
import { CollisionEnter, CollisionStay, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import { findTeam } from '../utils/find-team';
import { type AttackStats, MODS_MAP } from '../../../../consts/game';
import type {
  ModState,
  Mode,
} from '../../../components/weapon/weapon.component';
import { AttackDamageFn, AttackDestroyFn } from '../types';

import type { Attack } from './attack';

interface CircularSawAttackStats extends AttackStats {
  damage: number;
  damageFrequency: number;
  duration: number;
  changeDirectionCooldown: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileModel: string;
}

interface CircularSawAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: CircularSawAttackStats;
  mods?: Map<Mode, ModState>;
  onDamage: AttackDamageFn;
  onDestroy: AttackDestroyFn;
}

export class CircularSawAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: CircularSawAttackStats;
  private mods?: Map<Mode, ModState>;
  private onDamage: AttackDamageFn;
  private onDestroy: AttackDestroyFn;

  private shot: Actor;
  private lifetime: number;
  private changeDirectionTimer: number;
  private prevDirectionVector?: Vector2;

  private damageMap: Map<string, number>;

  isFinished: boolean;

  constructor({
    actor,
    spawner,
    scene,
    stats,
    mods,
    onDamage,
    onDestroy,
  }: CircularSawAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;
    this.mods = mods;
    this.onDamage = onDamage;
    this.onDestroy = onDestroy;

    this.damageMap = new Map();

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);
    const shotSprite = shot.getComponent(Sprite);

    shotCollider.radius = stats.projectileRadius;
    shotSprite.width = stats.projectileRadius * 2;
    shotSprite.height = stats.projectileRadius * 2;

    shotTransform.offsetX = offsetX;
    shotTransform.offsetY = offsetY;

    this.scene.appendChild(shot);

    this.shot = shot;
    this.lifetime = stats.duration;
    this.isFinished = false;

    const angle = MathOps.degToRad(MathOps.random(0, 360));

    const directionVector = VectorOps.getVectorByAngle(angle);
    directionVector.multiplyNumber(stats.projectileSpeed);

    this.shot.dispatchEvent(AddImpulse, { value: directionVector.clone() });
    this.prevDirectionVector = directionVector;

    this.changeDirectionTimer = this.stats.changeDirectionCooldown;

    this.shot.addEventListener(CollisionEnter, this.handleCollision);
    this.shot.addEventListener(CollisionStay, this.handleCollision);
  }

  destroy(): void {
    this.shot.removeEventListener(CollisionEnter, this.handleCollision);
    this.shot.removeEventListener(CollisionStay, this.handleCollision);
  }

  private handleCollision = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    const { damage } = this.stats;
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

    if (this.damageMap.has(target.id)) {
      return;
    }

    target.dispatchEvent(EventType.Damage, {
      value: damage,
      actor: this.actor,
    });

    this.damageMap.set(target.id, this.stats.damageFrequency);

    const frostMod = this.mods?.get('frost');
    const frostModOptions = frostMod
      ? MODS_MAP['frost'][frostMod.level]
      : undefined;

    const poisonMod = this.mods?.get('poison');
    const poisonModParams = poisonMod
      ? MODS_MAP['poison'][poisonMod.level]
      : undefined;
    const poisonModOptions = poisonModParams
      ? {
          ...poisonModParams,
          damage: poisonModParams.damageFactor * this.stats.damage,
        }
      : undefined;

    this.onDamage(target, frostModOptions, poisonModOptions);
  };

  private updateDirection(deltaTime: number): void {
    this.changeDirectionTimer -= deltaTime;

    if (this.changeDirectionTimer <= 0) {
      if (this.prevDirectionVector) {
        this.prevDirectionVector.multiplyNumber(-1);
        this.shot.dispatchEvent(AddImpulse, {
          value: this.prevDirectionVector.clone(),
        });
      }

      const angle = MathOps.degToRad(MathOps.random(0, 360));
      const directionVector = VectorOps.getVectorByAngle(angle);
      directionVector.multiplyNumber(this.stats.projectileSpeed);

      this.shot.dispatchEvent(AddImpulse, { value: directionVector.clone() });

      this.prevDirectionVector = directionVector;

      this.changeDirectionTimer = this.stats.changeDirectionCooldown;
    }
  }

  private updateDamageFrequency(deltaTime: number): void {
    this.damageMap.forEach((entry, key) => {
      const cooldown = entry - deltaTime;
      if (cooldown <= 0) {
        this.damageMap.delete(key);
      } else {
        this.damageMap.set(key, entry - deltaTime);
      }
    });
  }

  update(deltaTime: number): void {
    if (this.isFinished) {
      return;
    }

    this.updateDamageFrequency(deltaTime);
    this.updateDirection(deltaTime);

    this.lifetime -= deltaTime;

    if (this.lifetime <= 0) {
      this.shot.dispatchEvent(EventType.Kill);
      this.isFinished = true;

      const explosionMod = this.mods?.get('explosion');
      const explosionModParams = explosionMod
        ? MODS_MAP['explosion'][explosionMod.level]
        : undefined;
      const explosionModOptions = explosionModParams
        ? {
            ...explosionModParams,
            damage: explosionModParams.damageFactor * this.stats.damage,
            radius:
              explosionModParams.radiusFactor * this.stats.projectileRadius,
          }
        : undefined;

      this.onDestroy(this.shot, explosionModOptions);
    }
  }
}
