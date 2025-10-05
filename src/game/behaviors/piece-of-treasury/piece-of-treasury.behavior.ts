import type { Scene, BehaviorOptions, ActorSpawner } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';
import type { CollisionEnterEvent } from 'dacha/events';
import Treasure  from '../../components/piece-of-treasury/piece-of-treasury.component.ts';
import { CollisionEnter } from 'dacha/events';
import { PLAYER_ACTOR_NAME, TREASURY_ACTOR_NAME } from '../../../consts/actors.ts';
import { COLLECTOR_AURA_PROJECTILE_ID } from '../../../consts/templates';
import * as EventType from '../../events';

@DefineBehavior({
  name: 'PieceOfTreasury',
})
export default class PieceOfTreasury extends Behavior {
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
  }

  private grabTreasure = () => {
    const treasure = this.actor.getComponent(Treasure);
    const storage = this.scene.findChildByName(TREASURY_ACTOR_NAME);
    if (storage) {
      storage.dispatchEvent(EventType.ReturnMoney, { value: treasure.amount });
    }

    this.actor.dispatchEvent(EventType.Kill);
  }

  private handleCollisionEnter = (event: CollisionEnterEvent): void => {
    const { actor } = event;

    if (actor.name != PLAYER_ACTOR_NAME && actor.templateId !== COLLECTOR_AURA_PROJECTILE_ID) {
      return;
    }

    this.grabTreasure();
  };
}
