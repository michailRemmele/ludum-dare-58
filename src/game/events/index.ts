import type { Actor, ActorEvent, SceneEvent } from 'dacha';

export const Movement = 'Movement';
export const MovementJump = 'MovementJump';

export const ControlStickInput = 'ControlStickInput';

export const AttackInput = 'AttackInput';
export const Attack = 'Attack';
export const Damage = 'Damage';
export const Kill = 'Kill';

export const ResetSaveState = 'ResetSaveState';

export const GameOver = 'GameOver';

export const StealMoney = 'StealMoney';
export const ReturnMoney = 'ReturnMoney';

export const IncreaseScorePoints = 'IncreaseScorePoints';
export const LevelUp = 'LevelUp';
export const UpdateTimer = 'UpdateTimer';
export const UpdateMoney = 'UpdateMoney';

export const PlayerPowerUp = 'PlayerPowerUp';
export const PickPlayerPowerUp = 'PickPlayerPowerUp';

export type MovementEvent = ActorEvent<{
  angle?: number;
  x?: number;
  y?: number;
}>;

export type AttackInputEvent = ActorEvent<{ x: number; y: number }>;
export type AttackEvent = ActorEvent<{ x: number; y: number }>;
export type DamageEvent = ActorEvent<{ value: number; actor?: Actor }>;

export type StealMoneyEvent = ActorEvent<{ value: number; actor: Actor }>;
export type ReturnMoneyEvent = ActorEvent<{ value: number; }>;

export type ControlStickInputEvent = SceneEvent<{ x: number; y: number }>;

export type GameOverEvent = SceneEvent<{
  isWin: boolean;
  levelIndex: number;
  score: number;
}>;

export type IncreaseScorePointsEvent = SceneEvent<{
  points: number;
}>;

export type LevelUpEvent = SceneEvent<{
  level: number;
  nextLevelScore: number;
  isMax: boolean;
}>;

export type UpdateTimerEvent = SceneEvent<{
  timeLeft: number;
}>;

export type UpdateMoneyEvent = SceneEvent<{
  amount: number;
}>;

export type PlayerPowerUpEvent = SceneEvent<{
  bonuses: string[];
}>;
export type PickPlayerPowerUpEvent = SceneEvent<{
  bonus: string;
}>;

declare module 'dacha' {
  export interface ActorEventMap {
    [Movement]: MovementEvent;
    [MovementJump]: ActorEvent;

    [AttackInput]: AttackInputEvent;
    [Attack]: ActorEvent;
    [Damage]: DamageEvent;
    [Kill]: ActorEvent;

    [StealMoney]: StealMoneyEvent;
    [ReturnMoney]: ReturnMoneyEvent;
  }

  export interface SceneEventMap {
    [ControlStickInput]: ControlStickInputEvent;
    [ResetSaveState]: SceneEvent;
    [GameOver]: GameOverEvent;
    [IncreaseScorePoints]: IncreaseScorePointsEvent;
    [LevelUp]: LevelUpEvent;
    [UpdateTimer]: UpdateTimerEvent;
    [UpdateMoney]: UpdateMoneyEvent;
    [PlayerPowerUp]: PlayerPowerUpEvent;
    [PickPlayerPowerUp]: PickPlayerPowerUpEvent;
  }
}
