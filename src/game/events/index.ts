import type { Actor, ActorEvent, SceneEvent } from 'dacha';

export const Movement = 'Movement';
export const MovementJump = 'MovementJump';

export const ControlStickInput = 'ControlStickInput';

export const AttackInput = 'AttackInput';
export const Attack = 'Attack';
export const Damage = 'Damage';
export const DamageDealt = 'DamageDealt';
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
export const BuyMod = 'BuyMod';

export const UpdateReward = 'UpdateReward';

export type MovementEvent = ActorEvent<{
  angle?: number;
  x?: number;
  y?: number;
}>;

export type AttackInputEvent = ActorEvent<{ x: number; y: number }>;
export type AttackEvent = ActorEvent<{ x: number; y: number }>;
export type DamageEvent = ActorEvent<{
  value: number;
  actor?: Actor;
  damageType?: 'base' | 'poison' | 'explosion';
}>;
export type DamageDealtEvent = ActorEvent<{
  value: number;
  actor?: Actor;
  damageType?: 'base' | 'poison' | 'explosion';
}>;
export type KillEvent = ActorEvent<{ actor?: Actor }>;

export type StealMoneyEvent = ActorEvent<{ value: number; actor: Actor }>;
export type ReturnMoneyEvent = ActorEvent<{ value: number }>;

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
  bonuses: { bonus: string; level: number }[];
  mod?: { mod: string; bonus: string; level: number; cost: number };
}>;
export type PickPlayerPowerUpEvent = SceneEvent<{
  bonus: { bonus: string; level: number };
}>;
export type BuyModEvent = SceneEvent<{
  mod: { mod: string; bonus: string; level: number; cost: number };
}>;

export type UpdateRewardEvent = SceneEvent<{
  amount: number;
}>;

declare module 'dacha' {
  export interface ActorEventMap {
    [Movement]: MovementEvent;
    [MovementJump]: ActorEvent;

    [AttackInput]: AttackInputEvent;
    [Attack]: ActorEvent;
    [Damage]: DamageEvent;
    [DamageDealt]: DamageDealtEvent;
    [Kill]: KillEvent;

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
    [BuyMod]: BuyModEvent;
    [UpdateReward]: UpdateRewardEvent;
  }
}
