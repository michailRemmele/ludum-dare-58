import type {
  ActorSpawner,
  Scene,
  BehaviorOptions,
  UpdateOptions,
} from 'dacha';
import { Actor, Behavior, Transform, MathOps, Sprite } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import TrackSegment from '../../components/track-segment/track-segment.component';
import Pocket from '../../components/pocket/pocket.component';

import * as EventType from '../../events';
import type { UpdateTimerEvent } from '../../events';
import Money from '../../components/money/money.component.ts';
import { CAN_LIFT_MONEY_NAME } from '../../../consts/templates';
import {
  ENEMIES,
  SPAWN_INCREASE_FREQUENCY_COOLDOWN,
  SPAWN_INCREASE_MULTIPLIER,
} from '../../../consts/game';

const DESTINATION_THRESOLD = 4;

@DefineBehavior({
  name: 'TrackBehavior',
})
export default class TrackBehavior extends Behavior {
  private actor: Actor;
  private actorSpawner: ActorSpawner;
  private scene: Scene;
  private trackSegments: Actor[];
  private mobs: Actor[];
  private mobDestinations: Record<string, number>;
  private mobDirections: Record<string, number>;
  private spawnCooldown: number;
  private spawnFrequency: number;
  private enemyTypeIndex: number;

  private increaseSpawnFrequencyCooldown: number;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;
    this.actorSpawner = options.actorSpawner;
    this.mobs = [];
    this.enemyTypeIndex = 0;

    this.mobDestinations = {};
    this.mobDirections = {};
    this.trackSegments = this.actor.children.filter((child) =>
      child.getComponent(TrackSegment),
    );
    this.spawnCooldown = 0;
    this.spawnFrequency = ENEMIES[this.enemyTypeIndex].frequency;

    this.increaseSpawnFrequencyCooldown = SPAWN_INCREASE_FREQUENCY_COOLDOWN;

    this.trackSegments.sort((a: Actor, b: Actor) => {
      const aTrackSegment = a.getComponent(TrackSegment);
      const bTrackSegment = b.getComponent(TrackSegment);

      return aTrackSegment.index - bTrackSegment.index;
    });

    this.scene.addEventListener(EventType.UpdateTimer, this.handleUpdateTimer);
  }

  destroy(): void {
    this.scene.removeEventListener(
      EventType.UpdateTimer,
      this.handleUpdateTimer,
    );
  }

  private updateSpawn(deltaTime: number): void {
    const mob = this.actorSpawner.spawn(ENEMIES[this.enemyTypeIndex].id);
    if (this.spawnCooldown > 0) {
      this.spawnCooldown -= deltaTime;
      return;
    }

    const spawnerTransform = this.actor.getComponent(Transform);
    const mobTransform = mob.getComponent(Transform);

    mobTransform.offsetX = spawnerTransform.offsetX;
    mobTransform.offsetY = spawnerTransform.offsetY;

    const mobMoney = mob.getComponent(Money);

    if (Math.random() < 0.2) {
      mobMoney.canLiftMoney = true;

      const moneyChild = mob.findChildByName(CAN_LIFT_MONEY_NAME);
      const sprite = moneyChild?.getComponent(Sprite);
      if (sprite) {
        sprite.disabled = false;
      }
    }

    this.scene.appendChild(mob);

    this.mobs.push(mob);

    this.spawnCooldown = this.spawnFrequency;
  }

  private handleUpdateTimer = (event: UpdateTimerEvent): void => {
    if (
      ENEMIES[this.enemyTypeIndex + 1] &&
      ENEMIES[this.enemyTypeIndex + 1].ms > event.timeLeft
    ) {
      this.enemyTypeIndex = this.enemyTypeIndex + 1;
      this.spawnFrequency = ENEMIES[this.enemyTypeIndex].frequency;
      this.increaseSpawnFrequencyCooldown = SPAWN_INCREASE_FREQUENCY_COOLDOWN;
    }
  };

  private updateTrackMovement(): void {
    this.mobs.forEach((actor) => {
      const transform = actor.getComponent(Transform);
      const pocket = actor.getComponent(Pocket);

      let intersectedSegmentIndex = this.trackSegments.findIndex((segment) => {
        const segmentTransform = segment.getComponent(Transform);
        const distance = MathOps.getDistanceBetweenTwoPoints(
          transform.offsetX,
          segmentTransform.offsetX,
          transform.offsetY,
          segmentTransform.offsetY,
        );

        return distance < DESTINATION_THRESOLD;
      });

      if (pocket && pocket.amount > 0 && this.mobDirections?.[actor.id] > 0) {
        intersectedSegmentIndex = this.trackSegments.length - 1;
        this.mobDirections[actor.id] = -1;
      }

      let nextSegmentIndex: number;
      if (!this.mobDestinations[actor.id]) {
        this.mobDirections[actor.id] = 1;
        nextSegmentIndex = 0;
      } else if (intersectedSegmentIndex !== -1) {
        nextSegmentIndex =
          intersectedSegmentIndex + this.mobDirections[actor.id];
      } else {
        nextSegmentIndex = intersectedSegmentIndex;
      }

      if (nextSegmentIndex !== -1 && this.trackSegments[nextSegmentIndex]) {
        const nextSegment = this.trackSegments[nextSegmentIndex];

        const { offsetX, offsetY } = actor.getComponent(Transform);
        const { offsetX: destX, offsetY: destY } =
          nextSegment.getComponent(Transform);

        const angle =
          MathOps.radToDeg(
            MathOps.getAngleBetweenTwoPoints(offsetX, destX, offsetY, destY),
          ) - 180;

        this.mobDestinations[actor.id] = angle;
        actor.dispatchEvent(EventType.Movement, { angle });

        return;
      }

      const angle = this.mobDestinations[actor.id];
      if (angle !== undefined) {
        actor.dispatchEvent(EventType.Movement, { angle });
      }
    });
  }

  private updateSpawnFrequency(deltaTime: number): void {
    this.increaseSpawnFrequencyCooldown -= deltaTime;

    if (this.increaseSpawnFrequencyCooldown <= 0) {
      this.spawnFrequency /= SPAWN_INCREASE_MULTIPLIER;
      this.increaseSpawnFrequencyCooldown = SPAWN_INCREASE_FREQUENCY_COOLDOWN;
    }
  }

  update(options: UpdateOptions): void {
    if (this.scene.data.isPaused || this.scene.data.isGameOver) {
      return;
    }

    this.updateSpawnFrequency(options.deltaTime);

    this.updateSpawn(options.deltaTime);
    this.updateTrackMovement();
  }
}
