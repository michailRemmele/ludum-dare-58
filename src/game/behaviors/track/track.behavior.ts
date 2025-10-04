import type {
  ActorSpawner,
  Scene,
  BehaviorOptions,
  UpdateOptions,
} from 'dacha';
import { Actor, Behavior, Transform, MathOps } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Track from '../../components/track/track.component.ts';
import TrackSegment from '../../components/track-segment/track-segment.component.ts';

import * as EventType from '../../events';

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
  private mobId: string;
  private mobDestinations: Record<string, number>;
  private mobDirections: Record<string, number>;
  private spawnCooldown: number;
  private spawnFrequency: number;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;
    this.actorSpawner = options.actorSpawner;
    this.mobs = [];

    const track = this.actor.getComponent(Track);

    this.mobId = track.mob;
    this.mobDestinations = {};
    this.mobDirections = {};
    this.trackSegments = this.actor.children.filter((child) =>
      child.getComponent(TrackSegment),
    );
    this.spawnCooldown = 0;
    this.spawnFrequency = track.frequency;

    this.trackSegments.sort((a: Actor, b: Actor) => {
      const aTrackSegment = a.getComponent(TrackSegment);
      const bTrackSegment = b.getComponent(TrackSegment);

      return aTrackSegment.index - bTrackSegment.index;
    });
  }

  private updateSpawn(deltaTime: number): void {
    const track = this.actor.getComponent(Track);
    if (track.maxNumber && track.maxNumber <= this.mobs.length) {
      return;
    }
    const mob = this.actorSpawner.spawn(this.mobId);
    if (this.spawnCooldown > 0) {
      this.spawnCooldown -= deltaTime;
      return;
    }

    const spawnerTransform = this.actor.getComponent(Transform);
    const mobTransform = mob.getComponent(Transform);

    mobTransform.offsetX = spawnerTransform.offsetX;
    mobTransform.offsetY = spawnerTransform.offsetY;

    this.scene.appendChild(mob);

    this.mobs.push(mob);

    this.spawnCooldown = this.spawnFrequency;
  }

  private updateTrackMovement(): void {
    this.mobs.forEach((actor) => {
      const transform = actor.getComponent(Transform);

      const intersectedSegmentIndex = this.trackSegments.findIndex(
        (segment) => {
          const segmentTransform = segment.getComponent(Transform);
          const distance = MathOps.getDistanceBetweenTwoPoints(
            transform.offsetX,
            segmentTransform.offsetX,
            transform.offsetY,
            segmentTransform.offsetY,
          );

          return distance < DESTINATION_THRESOLD;
        },
      );

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

      if (intersectedSegmentIndex === this.trackSegments.length - 1) {
        this.mobDirections[actor.id] = -1;
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

  update(options: UpdateOptions): void {
    this.updateSpawn(options.deltaTime);
    this.updateTrackMovement();
  }
}
