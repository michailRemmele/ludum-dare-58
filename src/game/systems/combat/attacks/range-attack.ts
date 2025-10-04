import {
  Actor,
  MathOps,
  VectorOps,
  Transform,
  Collider,
  RigidBody,
} from 'dacha';
import type { ActorSpawner, Scene } from 'dacha';
import { CollisionEnter, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import { findTeam } from '../utils/find-team';
import type { AttackStats } from '../attack-stats-map';

import type { Attack } from './attack';

interface RangeAttackStats extends AttackStats {
  damage: number;
  range: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileModel: string;
}

interface RangeAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: RangeAttackStats;
}

export class RangeAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: RangeAttackStats;

  private shot: Actor;
  private lifetime: number;

  isFinished: boolean;

  constructor({ actor, spawner, scene, enemies, stats }: RangeAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);

    shotCollider.radius = stats.projectileRadius;

    const target = enemies[MathOps.random(0, enemies.length - 1)];
    const targetTransform = target.getComponent(Transform);

    const angle = MathOps.getAngleBetweenTwoPoints(
      targetTransform.offsetX,
      offsetX,
      targetTransform.offsetY,
      offsetY,
    );

    shotTransform.offsetX = offsetX;
    shotTransform.offsetY = offsetY;
    shotTransform.rotation = MathOps.radToDeg(angle);

    this.scene.appendChild(shot);

    const directionVector = VectorOps.getVectorByAngle(angle);

    directionVector.multiplyNumber(stats.projectileSpeed);

    const flightTime = 1000 * (stats.range / stats.projectileSpeed!);

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
    const { actor } = event;

    const { damage } = this.stats;
    const team = this.actor.getComponent(Team);

    const hitBox = actor.getComponent(HitBox);
    const rigidBody = actor.getComponent(RigidBody);
    const targetTeam = findTeam(actor);
    const target = actor.parent;

    if (team && targetTeam && team?.index === targetTeam?.index) {
      return;
    }

    if (rigidBody && !rigidBody.isPermeable && !rigidBody.ghost) {
      this.lifetime = 0;
    }

    if (!hitBox || !target || !(target instanceof Actor)) {
      return;
    }

    target.dispatchEvent(EventType.Damage, {
      value: damage,
      actor: this.actor,
    });
    this.lifetime = 0;
  };

  update(deltaTime: number): void {
    if (this.isFinished) {
      return;
    }

    this.lifetime -= deltaTime;

    if (this.lifetime <= 0) {
      this.shot.dispatchEvent(EventType.Kill);
      this.isFinished = true;
    }
  }
}
