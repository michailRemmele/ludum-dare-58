import type { Scene, BehaviorOptions } from 'dacha';
import { Actor, Behavior } from 'dacha';
import { DefineBehavior } from 'dacha-workbench/decorators';

import Storage from '../../components/storage/storage.component';
import LevelInfo from '../../components/level-info/level-info.component';
import Score from '../../components/score/score.component';
import * as EventType from '../../events';
import type { StealMoneyEvent } from '../../events';

@DefineBehavior({
  name: 'Treasury',
})
export default class Treasury extends Behavior {
  private actor: Actor;
  private scene: Scene;

  constructor(options: BehaviorOptions) {
    super();

    const { actor, scene } = options;

    this.actor = actor;
    this.scene = scene;

    this.actor.addEventListener(EventType.StealMoney, this.handleStealMoney);
  }

  destroy(): void {
    this.actor.removeEventListener(EventType.StealMoney, this.handleStealMoney);
  }

  private handleStealMoney = (event: StealMoneyEvent): void => {
    const storage = this.actor.getComponent(Storage);
    const levelInfo = this.actor.getComponent(LevelInfo);
    const score = this.actor.getComponent(Score);

    storage.amount -= event.value;

    if (storage.amount <= 0) {
      this.scene.dispatchEvent(EventType.GameOver, {
        isWin: false,
        levelIndex: levelInfo.index,
        score: score.value,
      });
    }
  };
}
