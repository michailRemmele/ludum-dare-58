import type { Actor } from 'dacha';

export interface FrostOptions {
  duration: number;
  slowFactor: number;
}
export interface PoisonOptions {
  duration: number;
  frequency: number;
  damage: number;
}

export type AttackDamageFn = (
  target: Actor,
  frostOptions?: FrostOptions,
  poisonOptions?: PoisonOptions,
) => void;
export type AttackDestroyFn = (
  actor: Actor,
  explosionOptions?: {
    radius: number;
    damage: number;
  },
) => void;
