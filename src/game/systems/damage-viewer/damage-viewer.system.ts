import {
  SceneSystem,
  ActorQuery,
  Transform,
  BitmapText,
  RendererService,
  MathOps,
} from 'dacha';
import type {
  Scene,
  SceneSystemOptions,
  ActorSpawner,
  UpdateOptions,
} from 'dacha';
import { DefineSystem } from 'dacha-workbench/decorators';

import * as EventType from '../../events';
import type { DamageDealtEvent } from '../../events';
import { DAMAGE_NUMBER_ID } from '../../../consts/templates';
import { PLAYER_ACTOR_NAME } from '../../../consts/actors';

const BASE_FONT_SIZE = 5;
const TEXT_LIFETIME = 300;
const POISON_COLOR = '#1eb61c';
const EXPLOSION_COLOR = '#fe2a46';

@DefineSystem({
  name: 'DamageViewer',
})
export default class DamageViewer extends SceneSystem {
  private scene: Scene;
  private spawner: ActorSpawner;

  private rendererService: RendererService;

  private actorQuery: ActorQuery;
  private lifetimeMap: Record<string, number>;

  constructor(options: SceneSystemOptions) {
    super();

    const { scene, actorSpawner, world } = options;

    this.scene = scene;
    this.spawner = actorSpawner;

    this.rendererService = world.getService(RendererService);

    this.actorQuery = new ActorQuery({
      scene,
      filter: [Transform, BitmapText],
    });

    this.lifetimeMap = {};

    this.scene.addEventListener(EventType.DamageDealt, this.handleDamageDealt);
  }

  onSceneDestroy(): void {
    this.scene.removeEventListener(
      EventType.DamageDealt,
      this.handleDamageDealt,
    );
  }

  private handleDamageDealt = (event: DamageDealtEvent): void => {
    const { target, actor, damageType, value } = event;

    if (!actor || actor.name !== PLAYER_ACTOR_NAME) {
      return;
    }

    const text = this.spawner.spawn(DAMAGE_NUMBER_ID);
    const bitmap = text.getComponent(BitmapText);

    bitmap.text = String(value);
    bitmap.fontSize = BASE_FONT_SIZE;

    if (damageType === 'poison') {
      bitmap.text = String(Math.ceil(value));
      bitmap.color = POISON_COLOR;
    }
    if (damageType === 'explosion') {
      bitmap.color = EXPLOSION_COLOR;
    }

    const transform = text.getComponent(Transform);

    const targetBounds = this.rendererService.getBounds(target);

    transform.offsetX = MathOps.random(targetBounds.minX, targetBounds.maxX);
    transform.offsetY = MathOps.random(
      targetBounds.minY - 10,
      targetBounds.minY,
    );

    this.lifetimeMap[text.id] = TEXT_LIFETIME;

    this.scene.appendChild(text);
  };

  update(options: UpdateOptions): void {
    for (const actor of this.actorQuery.getActors()) {
      const transform = actor.getComponent(Transform);
      const bitmap = actor.getComponent(BitmapText);

      transform.offsetY -= 0.5;
      bitmap.fontSize += 0.1;

      this.lifetimeMap[actor.id] -= options.deltaTime;

      if (this.lifetimeMap[actor.id] <= 0) {
        actor.remove();
        delete this.lifetimeMap[actor.id];
      }
    }
  }
}
