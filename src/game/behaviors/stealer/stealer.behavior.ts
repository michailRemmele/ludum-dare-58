import type { ActorSpawner, BehaviorOptions, Scene } from 'dacha';
import { Actor, Behavior, Transform } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';
import { CollisionEnter, type CollisionEnterEvent } from 'dacha/events';

import Storage from '../../components/storage/storage.component';
import Pocket from '../../components/pocket/pocket.component';
import * as EventType from '../../events';
import type { KillEvent } from '../../events';
import PieceOfTreasury from '../../components/piece-of-treasury/piece-of-treasury.component';
import { PLAYER_ACTOR_NAME } from '../../../consts/actors';

@DefineBehavior({
  name: 'Stealer',
})
export default class Stealer extends Behavior {
  private actor: Actor;
  private scene: Scene;
  private actorSpawner: ActorSpawner;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;
    this.actorSpawner = options.actorSpawner;

    this.actor.addEventListener(CollisionEnter, this.handleCollisionEnter);
    this.actor.addEventListener(EventType.Kill, this.handleKill);
  }

  destroy(): void {
    this.actor.removeEventListener(CollisionEnter, this.handleCollisionEnter);
  }

  private handleKill = (event: KillEvent): void => {
    const { target, actor } = event;
    const { amount } = target.getComponent(Pocket);

    if (actor?.name !== PLAYER_ACTOR_NAME) {
      return;
    }

    if (amount > 0) {
      const lostPiece = this.actorSpawner.spawn(
        '516256dc-2acb-46fd-bfb0-20a905521cbc',
      );
      const lostPieceTransform = lostPiece.getComponent(Transform);
      const targetTransform = event.target.getComponent(Transform);

      lostPieceTransform.offsetX = targetTransform.offsetX;
      lostPieceTransform.offsetY = targetTransform.offsetY;

      const lostPieceAmount = lostPiece.getComponent(PieceOfTreasury);

      lostPieceAmount.amount = amount;

      this.scene.appendChild(lostPiece);
    }
  };

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    if (!actor.getComponent(Storage)) {
      return;
    }

    const storage = actor.getComponent(Storage);
    const pocket = this.actor.getComponent(Pocket);

    if (pocket.amount > 0) {
      return;
    }

    const amount = Math.min(storage.amount, pocket.size);

    pocket.amount = amount;

    actor.dispatchEvent(EventType.StealMoney, {
      value: amount,
      actor: this.actor,
    });
  };
}
