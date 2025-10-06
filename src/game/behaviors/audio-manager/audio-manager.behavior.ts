import type { Actor, Scene, BehaviorOptions } from 'dacha';
import { Behavior } from 'dacha';
import { PlayAudio, StopAudio } from 'dacha/events';
import { DefineBehavior, DefineField } from 'dacha-workbench/decorators';

import * as EventType from '../../events';
import type { GameOverEvent } from '../../events';

interface AudioManagerBehaviorOptions extends BehaviorOptions {
  backgroundMusic: string;
  levelUp: string;
  powerUp: string;
  fishDamage: string;
  fishDeath: string;
  fishBite: string;
  enemyShoot: string;
  win: string;
  lose: string;
}

@DefineBehavior({
  name: 'AudioManagerBehavior',
})
export default class AudioManagerBehavior extends Behavior {
  private scene: Scene;

  @DefineField({
    type: 'string',
  })
  private backgroundMusic: Actor;

  @DefineField({
    type: 'string',
  })
  private levelUp: Actor;

  @DefineField({
    type: 'string',
  })
  private powerUp: Actor;

  @DefineField({
    type: 'string',
  })
  private fishDamage: Actor;

  @DefineField({
    type: 'string',
  })
  private fishBite: Actor;

  @DefineField({
    type: 'string',
  })
  private enemyShoot: Actor;

  @DefineField({
    type: 'string',
  })
  private win: Actor;

  @DefineField({
    type: 'string',
  })
  private lose: Actor;

  constructor(options: AudioManagerBehaviorOptions) {
    super();

    this.scene = options.scene;

    this.backgroundMusic = this.scene.findChildById(options.backgroundMusic)!;
    this.levelUp = this.scene.findChildById(options.levelUp)!;
    this.powerUp = this.scene.findChildById(options.powerUp)!;
    this.fishDamage = this.scene.findChildById(options.fishDamage)!;
    this.fishBite = this.scene.findChildById(options.fishBite)!;
    this.enemyShoot = this.scene.findChildById(options.enemyShoot)!;
    this.win = this.scene.findChildById(options.win)!;
    this.lose = this.scene.findChildById(options.lose)!;

    this.scene.addEventListener(EventType.LevelUp, this.handleLevelUp);
    this.scene.addEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePowerUp,
    );
    this.scene.addEventListener(EventType.StealMoney, this.handleFishDamage);
    this.scene.addEventListener(EventType.PlayerAttack, this.handleEnemyShoot);
    this.scene.addEventListener(EventType.DamageDealt, this.handleFishBite);
    this.scene.addEventListener(EventType.GameOver, this.handleGameOver);
  }

  destroy(): void {
    this.scene.removeEventListener(EventType.LevelUp, this.handleLevelUp);
    this.scene.removeEventListener(
      EventType.PickPlayerPowerUp,
      this.handlePowerUp,
    );
    this.scene.removeEventListener(EventType.StealMoney, this.handleFishDamage);
    this.scene.removeEventListener(
      EventType.PlayerAttack,
      this.handleEnemyShoot,
    );
    this.scene.removeEventListener(EventType.DamageDealt, this.handleFishBite);
    this.scene.removeEventListener(EventType.GameOver, this.handleGameOver);
  }

  private handleLevelUp = (): void => {
    this.levelUp.dispatchEvent(PlayAudio);
  };

  private handlePowerUp = (): void => {
    this.powerUp.dispatchEvent(PlayAudio);
  };

  private handleFishDamage = (): void => {
    this.fishDamage.dispatchEvent(PlayAudio);
  };

  private handleFishBite = (): void => {
    this.fishBite.dispatchEvent(PlayAudio);
  };

  private handleEnemyShoot = (): void => {
    this.enemyShoot.dispatchEvent(PlayAudio);
  };

  private handleGameOver = (event: GameOverEvent): void => {
    if (event.isWin) {
      this.win.dispatchEvent(PlayAudio);
    } else {
      this.lose.dispatchEvent(PlayAudio);
    }
    this.backgroundMusic.dispatchEvent(StopAudio);
  };
}
