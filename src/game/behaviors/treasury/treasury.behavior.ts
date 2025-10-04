import {
  Actor,
  Behavior,
  type UpdateOptions,
  type Scene,
  type BehaviorOptions,
} from 'dacha';
import { DefineBehavior, DefineField } from 'dacha-workbench/decorators';

import Storage from '../../components/storage/storage.component';
import LevelInfo from '../../components/level-info/level-info.component';
import Score from '../../components/score/score.component';
import * as EventType from '../../events';
import type { StealMoneyEvent, ReturnMoneyEvent, IncreaseScorePointsEvent } from '../../events';
import { LEVEL_UP_BASE_STEP, MAX_LEVEL } from '../../../consts/game';

const TIMER_UPDATE_FREQUENCY = 1000;

interface TreasuryBehaviorOptions extends BehaviorOptions {
  levelDuration: number;
}

@DefineBehavior({
  name: 'Treasury',
})
export default class Treasury extends Behavior {
  @DefineField()
  private levelDuration: number;

  private actor: Actor;
  private scene: Scene;

  private playerLevel: number;
  private nextLevelScore: number;

  private timerUpdateCooldown: number;

  constructor(options: TreasuryBehaviorOptions) {
    super();

    const { actor, scene, levelDuration } = options;

    this.actor = actor;
    this.scene = scene;

    this.playerLevel = 1;
    this.nextLevelScore = LEVEL_UP_BASE_STEP;
    this.levelDuration = levelDuration * 60 * 1000;

    this.timerUpdateCooldown = 0;

    this.actor.addEventListener(EventType.StealMoney, this.handleStealMoney);
    this.actor.addEventListener(EventType.ReturnMoney, this.handleReturnMoney);
    this.scene.addEventListener(
      EventType.IncreaseScorePoints,
      this.handleIncreaseScorePoints,
    );
  }

  destroy(): void {
    this.actor.removeEventListener(EventType.StealMoney, this.handleStealMoney);
    this.actor.removeEventListener(EventType.ReturnMoney, this.handleReturnMoney);
    this.scene.removeEventListener(
      EventType.IncreaseScorePoints,
      this.handleIncreaseScorePoints,
    );
  }

  private handleStealMoney = (event: StealMoneyEvent): void => {
    const storage = this.actor.getComponent(Storage);
    const levelInfo = this.actor.getComponent(LevelInfo);
    const score = this.actor.getComponent(Score);

    storage.amount -= event.value;

    this.scene.dispatchEvent(EventType.UpdateMoney, { amount: storage.amount });

    if (storage.amount <= 0) {
      this.scene.dispatchEvent(EventType.GameOver, {
        isWin: false,
        levelIndex: levelInfo.index,
        score: score.value,
      });
    }
  };

  private handleReturnMoney = (event: ReturnMoneyEvent): void => {
    const storage = this.actor.getComponent(Storage);

    storage.amount += event.value;

    this.scene.dispatchEvent(EventType.UpdateMoney, { amount: storage.amount });
  };

  private handleIncreaseScorePoints = (
    event: IncreaseScorePointsEvent,
  ): void => {
    const score = this.actor.getComponent(Score);

    score.value += event.points;

    if (this.playerLevel < MAX_LEVEL && score.value >= this.nextLevelScore) {
      this.playerLevel += 1;
      this.nextLevelScore += this.playerLevel * LEVEL_UP_BASE_STEP;

      this.scene.dispatchEvent(EventType.LevelUp, {
        level: this.playerLevel,
        nextLevelScore: this.nextLevelScore,
        isMax: this.playerLevel === MAX_LEVEL,
      });
    }
  };

  update(options: UpdateOptions): void {
    this.levelDuration -= options.deltaTime;
    this.timerUpdateCooldown -= options.deltaTime;

    if (this.timerUpdateCooldown <= 0) {
      this.scene.dispatchEvent(EventType.UpdateTimer, {
        timeLeft: this.levelDuration,
      });
      this.timerUpdateCooldown = TIMER_UPDATE_FREQUENCY;
    }

    if (this.levelDuration <= 0) {
      const levelInfo = this.actor.getComponent(LevelInfo);
      const score = this.actor.getComponent(Score);

      this.scene.dispatchEvent(EventType.GameOver, {
        isWin: false,
        levelIndex: levelInfo.index,
        score: score.value,
      });
    }
  }
}
