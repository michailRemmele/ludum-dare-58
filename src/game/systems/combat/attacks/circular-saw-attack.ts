import {
  Actor,
  MathOps,
  VectorOps,
  Transform,
  Collider,
  RigidBody,
} from 'dacha';
import type { ActorSpawner, Scene, Vector2 } from 'dacha';
import { CollisionEnter, CollisionStay, AddImpulse } from 'dacha/events';
import type { CollisionEnterEvent } from 'dacha/events';

import * as EventType from '../../../events';
import HitBox from '../../../components/hit-box/hit-box.component';
import Team from '../../../components/team/team.component';
import { findTeam } from '../utils/find-team';
import type { AttackStats } from '../../../../consts/game';

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
}

export class CircularSawAttack implements Attack {
  private actor: Actor;
  private spawner: ActorSpawner;
  private scene: Scene;

  private stats: CircularSawAttackStats;

  private shot: Actor;
  private lifetime: number;
  private changeDirectionTimer: number;
  private prevDirectionVector?: Vector2;

  private damageMap: Map<string, number>;

  isFinished: boolean;

  constructor({ actor, spawner, scene, stats }: CircularSawAttackOptions) {
    this.actor = actor;
    this.spawner = spawner;
    this.scene = scene;
    this.stats = stats;

    this.damageMap = new Map();

    const { offsetX, offsetY } = this.actor.getComponent(Transform);

    const shot = this.spawner.spawn(stats.projectileModel);
    const shotTransform = shot.getComponent(Transform);
    const shotCollider = shot.getComponent(Collider);

    shotCollider.radius = stats.projectileRadius;

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

    if (this.damageMap.has(target.id)) {
      return;
    }

    target.dispatchEvent(EventType.Damage, {
      value: damage,
      actor: this.actor,
    });

    this.damageMap.set(target.id, this.stats.damageFrequency);
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
    }
  }
}
