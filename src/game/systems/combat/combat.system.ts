import { ActorCollection, SceneSystem } from 'dacha';
import type {
  Scene,
  ActorSpawner,
  SceneSystemOptions,
  UpdateOptions,
} from 'dacha';
import { RemoveActor } from 'dacha/events';
import type { RemoveActorEvent } from 'dacha/events';
import { DefineSystem } from 'dacha-workbench/decorators';

import Weapon from '../../components/weapon/weapon.component';

import { SimpleFighter } from './fighters';
import type { Fighter } from './fighters';

@DefineSystem({
  name: 'CombatSystem',
})
export default class CombatSystem extends SceneSystem {
  private scene: Scene;
  private actorCollection: ActorCollection;
  private actorSpawner: ActorSpawner;

  private fighters: Record<string, Fighter>;

  constructor(options: SceneSystemOptions) {
    super();

    this.scene = options.scene;
    this.actorCollection = new ActorCollection(options.scene, {
      components: [Weapon],
    });
    this.actorSpawner = options.actorSpawner;

    this.fighters = {};

    this.actorCollection.addEventListener(RemoveActor, this.handleRemoveActor);
  }

  onSceneDestroy(): void {
    this.actorCollection.removeEventListener(
      RemoveActor,
      this.handleRemoveActor,
    );
  }

  private handleRemoveActor = (event: RemoveActorEvent): void => {
    this.fighters[event.actor.id].destroy();
    delete this.fighters[event.actor.id];
  };

  private updateFighters(deltaTime: number): void {
    this.actorCollection.forEach((actor) => {
      if (!this.fighters[actor.id]) {
        this.fighters[actor.id] = new SimpleFighter(
          actor,
          this.actorSpawner,
          this.scene,
        );
      } else {
        this.fighters[actor.id].update(deltaTime);
      }
    });
  }

  update(options: UpdateOptions): void {
    const { deltaTime } = options;

    this.updateFighters(deltaTime);
  }
}
