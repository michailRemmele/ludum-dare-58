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

export type MovementEvent = ActorEvent<{
  angle?: number;
  x?: number;
  y?: number;
}>;

export type AttackInputEvent = ActorEvent<{ x: number; y: number }>;
export type AttackEvent = ActorEvent<{ x: number; y: number }>;
export type DamageEvent = ActorEvent<{ value: number; actor?: Actor }>;

export type StealMoneyEvent = ActorEvent<{ value: number; actor: Actor }>;

export type ControlStickInputEvent = SceneEvent<{ x: number; y: number }>;

export type GameOverEvent = SceneEvent<{
  isWin: boolean;
  levelIndex: number;
  score: number;
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
  }

  export interface SceneEventMap {
    [ControlStickInput]: ControlStickInputEvent;
    [ResetSaveState]: SceneEvent;
    [GameOver]: GameOverEvent;
  }
}
