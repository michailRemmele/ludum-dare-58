import { Actor, MathOps, VectorOps, Transform, Collider } from 'dacha';
import type { ActorSpawner, Scene } from 'dacha';
import { CollisionEnter, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import { findTeam } from '../utils/find-team';
import type { AttackStats } from '../../../../consts/game';

import type { Attack } from './attack';

const SPREAD = 45;

const generateAngles = (
  quantity: number,
  angle: number,
  spread: number,
): number[] => {
  if (quantity <= 0) return [];
  if (quantity === 1) return [angle];

  const angles = [];
  const halfSpread = spread / 2;

  if (quantity === 2) {
    angles.push(angle - halfSpread, angle + halfSpread);
  } else {
    const step = spread / (quantity - 1);

    for (let i = 0; i < quantity; i += 1) {
      const offset = -halfSpread + i * step;
      angles.push(angle + offset);
    }
  }

  return angles.map((angle) => {
    const normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  });
};

const generatePower = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

interface ShotgunAttackStats extends AttackStats {
  damage: number;
  range: number;
  projectileQuantity: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileModel: string;
}

interface ShotgunAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: ShotgunAttackStats;
}

export class ShotgunAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: ShotgunAttackStats;

  private shots: Actor[];
  private lifetime: number;

  isFinished: boolean;

  constructor({ actor, spawner, scene, enemies, stats }: ShotgunAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;

    this.shots = [];

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const target = enemies[MathOps.random(0, enemies.length - 1)];
    const targetTransform = target.getComponent(Transform);

    const angle = MathOps.radToDeg(
      MathOps.getAngleBetweenTwoPoints(
        targetTransform.offsetX,
        offsetX,
        targetTransform.offsetY,
        offsetY,
      ),
    );

    const angles = generateAngles(this.stats.projectileQuantity, angle, SPREAD);

    angles.forEach((projectileAngle) => {
      const shot = this.spawnProjectile(offsetX, offsetY, projectileAngle);
      this.shots.push(shot);
    });

    const flightTime = 1000 * (stats.range / stats.projectileSpeed!);

    this.lifetime = flightTime;
    this.isFinished = false;
  }

  destroy(): void {
    this.shots.forEach((shot) => {
      shot.removeEventListener(CollisionEnter, this.handleCollisionEnter);
    });
  }

  private spawnProjectile(x: number, y: number, angle: number): Actor {
    const shot = this.spawner.spawn(this.stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);

    shotCollider.radius = this.stats.projectileRadius;

    shotTransform.offsetX = x;
    shotTransform.offsetY = y;
    shotTransform.rotation = angle;

    this.scene.appendChild(shot);

    const directionVector = VectorOps.getVectorByAngle(MathOps.degToRad(angle));

    directionVector.multiplyNumber(
      generatePower(0.8, 1.2) * this.stats.projectileSpeed,
    );

    shot.dispatchEvent(AddImpulse, { value: directionVector.clone() });

    shot.addEventListener(CollisionEnter, this.handleCollisionEnter);

    return shot;
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
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
    event.target.dispatchEvent(EventType.Kill);
  };

  update(deltaTime: number): void {
    if (this.isFinished) {
      return;
    }

    this.lifetime -= deltaTime;

    if (this.lifetime <= 0) {
      this.shots.forEach((shot) => {
        shot.dispatchEvent(EventType.Kill);
      });
      this.isFinished = true;
    }
  }
}
