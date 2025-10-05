import {
  Actor,
  Behavior,
  MathOps,
  type UpdateOptions,
  type Scene,
  type BehaviorOptions,
} from 'dacha';
import { DefineBehavior, DefineField } from 'dacha-workbench/decorators';

import Storage from '../../components/storage/storage.component';
import LevelInfo from '../../components/level-info/level-info.component';
import Score from '../../components/score/score.component';
import Weapon from '../../components/weapon/weapon.component';
import * as EventType from '../../events';
import type {
  StealMoneyEvent,
  ReturnMoneyEvent,
  IncreaseScorePointsEvent,
  PickPlayerPowerUpEvent,
} from '../../events';
import {
  LEVEL_UP_BASE_STEP,
  MAX_LEVEL,
  ATTACK_STATS_MAP,
} from '../../../consts/game';
import { PLAYER_ACTOR_NAME } from '../../../consts/actors';

const TIMER_UPDATE_FREQUENCY = 1000;

function getRandomEntries(entries: string[], count: number): string[] {
  const result = [];
  const usedIndices = new Set();

  while (result.length < Math.min(entries.length, count)) {
    const randomIndex = MathOps.random(0, entries.length - 1);

    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      result.push(entries[randomIndex]);
    }
  }

  return result;
}

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
    this.scene.addEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
    );
  }

  destroy(): void {
    this.actor.removeEventListener(EventType.StealMoney, this.handleStealMoney);
    this.actor.removeEventListener(
      EventType.ReturnMoney,
      this.handleReturnMoney,
    );
    this.scene.removeEventListener(
      EventType.IncreaseScorePoints,
      this.handleIncreaseScorePoints,
    );
    this.scene.removeEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePickPlayerPowerUp,
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

      this.scene.data.isGameOver = true;
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

      this.scene.dispatchEvent(EventType.PlayerPowerUp, {
        bonuses: getRandomEntries(Object.keys(ATTACK_STATS_MAP), 3),
      });

      this.scene.data.isPaused = true;
    }
  };

  private handlePickPlayerPowerUp = (event: PickPlayerPowerUpEvent): void => {
    const { bonus } = event;
    const player = this.scene.findChildByName(PLAYER_ACTOR_NAME);

    if (player) {
      const weapon = player.getComponent(Weapon);
      const attackState = weapon.attacks.get(bonus);

      if (attackState) {
        attackState.level = Math.min(
          attackState.level + 1,
          ATTACK_STATS_MAP[bonus].length - 1,
        );
      } else {
        weapon.attacks.set(bonus, { level: 0, cooldownRemaining: 0 });
      }
    }

    this.scene.data.isPaused = false;
  };

  update(options: UpdateOptions): void {
    if (this.scene.data.isPaused || this.scene.data.isGameOver) {
      return;
    }

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
