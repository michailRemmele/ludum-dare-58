import { LEVEL_1_ID } from './scenes';
import { PROJECTILE_MODEL_ID } from './templates';

export const LEVEL_UP_BASE_STEP = 500;
export const MAX_LEVEL = 8;

export const LEVELS = [
  {
    id: LEVEL_1_ID,
    title: 'Level 1',
  },
];

export interface AttackStats extends Record<string, unknown> {
  cooldown: number;
}

export const ATTACK_STATS_MAP: Record<string, AttackStats[]> = {
  baseRange: [
    {
      damage: 5,
      cooldown: 500,
      range: 160,
      projectileRadius: 4,
      projectileModel: PROJECTILE_MODEL_ID,
      projectileSpeed: 100,
    },
    {
      damage: 10,
      cooldown: 450,
      range: 160,
      projectileRadius: 4,
      projectileModel: PROJECTILE_MODEL_ID,
      projectileSpeed: 100,
    },
    {
      damage: 15,
      cooldown: 400,
      range: 160,
      projectileRadius: 5,
      projectileModel: PROJECTILE_MODEL_ID,
      projectileSpeed: 100,
    },
  ],
};
