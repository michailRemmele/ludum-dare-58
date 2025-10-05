import { LEVEL_1_ID } from './scenes';
import {
  EASY_ENEMY,
  HEAVY_ENEMY,
  MIDDLE_ENEMY,
  BLASTER_PROJECTILE_ID,
  SHOTGUN_PROJECTILE_ID,
} from './templates';

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
  blaster: [
    {
      damage: 5,
      cooldown: 500,
      range: 160,
      projectileRadius: 4,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 100,
    },
    {
      damage: 10,
      cooldown: 450,
      range: 160,
      projectileRadius: 4,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 100,
    },
    {
      damage: 15,
      cooldown: 400,
      range: 160,
      projectileRadius: 5,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 100,
    },
  ],
  shotgun: [
    {
      damage: 2,
      cooldown: 500,
      range: 80,
      projectileQuantity: 4,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 150,
    },
    {
      damage: 3,
      cooldown: 500,
      range: 80,
      projectileQuantity: 5,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 150,
    },
    {
      damage: 4,
      cooldown: 500,
      range: 80,
      projectileQuantity: 6,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 150,
    },
  ],
};

export const ENEMIES = [
  {
    id: EASY_ENEMY, // easy
    ms: 5 * 60000,
    frequency: 2000
  },
  {
    id: MIDDLE_ENEMY, // middle
    ms: 4.8 * 60000,
    frequency: 4500
  },
  {
    id: HEAVY_ENEMY, // heavy
    ms: 4.5 * 60000,
    frequency: 6000
  },
];
