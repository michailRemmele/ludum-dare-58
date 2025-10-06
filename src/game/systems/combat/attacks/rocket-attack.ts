import {
  Actor,
  MathOps,
  VectorOps,
  Transform,
  Collider,
  ActorQuery,
} from 'dacha';
import type { ActorSpawner, Scene } from 'dacha';
import { CollisionEnter, AddImpulse, AddForce } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import ScorePoints from '../../../components/score-points/score-points.component';
import { findTeam } from '../utils/find-team';
import { type AttackStats, MODS_MAP } from '../../../../consts/game';
import type {
  ModState,
  Mode,
} from '../../../components/weapon/weapon.component';
import { AttackDamageFn, AttackDestroyFn } from '../types';

import type { Attack } from './attack';

const FREE_FLIGHT = 1000;
const FOLLOW_FORCE = 1000;

interface RocketAttackStats extends AttackStats {
  damage: number;
  range: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileModel: string;
}

interface RocketAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: RocketAttackStats;
  mods?: Map<Mode, ModState>;
  onDamage: AttackDamageFn;
  onDestroy: AttackDestroyFn;
}

export class RocketAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: RocketAttackStats;
  private mods?: Map<Mode, ModState>;
  private onDamage: AttackDamageFn;
  private onDestroy: AttackDestroyFn;

  private shot: Actor;
  private lifetime: number;
  private freeFlight: number;

  private enemiesQuery: ActorQuery;
  private target?: Actor | null;

  isFinished: boolean;

  constructor({
    actor,
    spawner,
    scene,
    stats,
    mods,
    onDamage,
    onDestroy,
  }: RocketAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;
    this.mods = mods;
    this.onDamage = onDamage;
    this.onDestroy = onDestroy;

    this.enemiesQuery = new ActorQuery({
      scene,
      filter: [Transform, ScorePoints],
    });

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);

    shotCollider.radius = stats.projectileRadius;

    const angle = MathOps.degToRad(MathOps.random(0, 360));

    shotTransform.offsetX = offsetX;
    shotTransform.offsetY = offsetY;
    shotTransform.rotation = MathOps.radToDeg(angle);

    this.scene.appendChild(shot);

    const directionVector = VectorOps.getVectorByAngle(angle);

    directionVector.multiplyNumber(stats.projectileSpeed);

    const flightTime = 1000 * (stats.range / stats.projectileSpeed!);

    this.freeFlight = FREE_FLIGHT;

    this.shot = shot;
    this.lifetime = flightTime;
    this.isFinished = false;

    this.shot.dispatchEvent(AddImpulse, { value: directionVector.clone() });

    this.shot.addEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  destroy(): void {
    this.shot.removeEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    if (!this.target) {
      return;
    }

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

    target.dispatchEvent(EventType.Damage, {
      value: damage,
      actor: this.actor,
    });

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

    this.lifetime = 0;
  };

  private followTarget(): void {
    if (!this.target) {
      return;
    }

    const transform = this.shot.getComponent(Transform);
    const targetTransform = this.target.getComponent(Transform);

    const angle = MathOps.getAngleBetweenTwoPoints(
      targetTransform.offsetX,
      transform.offsetX,
      targetTransform.offsetY,
      transform.offsetY,
    );

    transform.rotation = MathOps.radToDeg(angle);

    const directionVector = VectorOps.getVectorByAngle(angle);

    directionVector.multiplyNumber(FOLLOW_FORCE);

    this.shot.dispatchEvent(AddForce, { value: directionVector.clone() });
  }

  private updateFreeFlight(deltaTime: number): void {
    if (this.target !== undefined) {
      return;
    }

    this.freeFlight -= deltaTime;

    if (this.freeFlight <= 0) {
      const enemies = Array.from(this.enemiesQuery.getActors());

      if (!enemies.length) {
        this.target = null;
        return;
      }

      this.target = enemies[MathOps.random(0, enemies.length - 1)];
    }
  }

  update(deltaTime: number): void {
    if (this.isFinished) {
      return;
    }

    this.updateFreeFlight(deltaTime);
    this.followTarget();

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
