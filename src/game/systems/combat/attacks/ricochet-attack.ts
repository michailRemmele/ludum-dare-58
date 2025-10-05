import {
  Actor,
  MathOps,
  VectorOps,
  Transform,
  Collider,
  Shape,
  RigidBody,
} from 'dacha';
import type { ActorSpawner, Scene, Vector2 } from 'dacha';
import { CollisionEnter, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import { findTeam } from '../utils/find-team';
import type { AttackStats } from '../../../../consts/game';

import type { Attack } from './attack';

export const getReflectedAngle = (
  directionVector: Vector2,
  mtv: Vector2,
): number => {
  const normalVector = mtv.clone();
  normalVector.multiplyNumber(1 / mtv.magnitude);

  const dotProduct = VectorOps.dotProduct(normalVector, directionVector);

  const rx = directionVector.x - 2 * dotProduct * normalVector.x;
  const ry = directionVector.y - 2 * dotProduct * normalVector.y;

  return Math.atan2(ry, rx);
};

interface RicochetAttackStats extends AttackStats {
  damage: number;
  bounces: number;
  projectileRadius: number;
  projectileSpeed: number;
  projectileModel: string;
}

interface RicochetAttackOptions {
  actor: Actor;
  spawner: ActorSpawner;
  scene: Scene;
  enemies: Actor[];
  stats: RicochetAttackStats;
}

export class RicochetAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: RicochetAttackStats;

  private shot: Actor;
  private bouncesLeft: number;

  private prevDirectionVector: Vector2;

  isFinished: boolean;

  constructor({ actor, spawner, scene, stats }: RicochetAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);
    const shotShape = shot.getComponent(Shape);

    shotCollider.radius = stats.projectileRadius;
    shotShape.radius = stats.projectileRadius;

    shotTransform.offsetX = offsetX;
    shotTransform.offsetY = offsetY;

    this.scene.appendChild(shot);

    this.shot = shot;
    this.bouncesLeft = stats.bounces;
    this.isFinished = false;

    const angle = MathOps.degToRad(MathOps.random(0, 360));

    const directionVector = VectorOps.getVectorByAngle(angle);
    directionVector.multiplyNumber(stats.projectileSpeed);

    this.prevDirectionVector = directionVector;

    this.shot.dispatchEvent(AddImpulse, { value: directionVector.clone() });

    this.shot.addEventListener(CollisionEnter, this.handleCollision);
  }

  destroy(): void {
    this.shot.removeEventListener(CollisionEnter, this.handleCollision);
  }

  private handleCollision = (event: CollisionEnterEvent): void => {
    const { actor, mtv } = event;

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
      this.bouncesLeft -= 1;

      const stopVector = this.prevDirectionVector.clone();

      stopVector.multiplyNumber(-1);
      this.shot.dispatchEvent(AddImpulse, {
        value: stopVector,
      });

      const reflectedAngle = getReflectedAngle(this.prevDirectionVector, mtv);

      const directionVector = VectorOps.getVectorByAngle(reflectedAngle);
      directionVector.multiplyNumber(
        this.stats.projectileSpeed *
          0.6 *
          (this.stats.bounces - this.bouncesLeft + 1),
      );

      this.shot.dispatchEvent(AddImpulse, {
        value: directionVector.clone(),
      });

      this.prevDirectionVector = directionVector;
    }

    if (!hitBox || !target || !(target instanceof Actor)) {
      return;
    }

    target.dispatchEvent(EventType.Damage, {
      value: damage,
      actor: this.actor,
    });
  };

  update(): void {
    if (this.isFinished) {
      return;
    }

    if (this.bouncesLeft <= 0) {
      this.shot.dispatchEvent(EventType.Kill);
      this.isFinished = true;
    }
  }
}
