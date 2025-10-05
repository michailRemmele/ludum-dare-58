import { LEVEL_1_ID } from './scenes';
import {
  EASY_ENEMY,
  HEAVY_ENEMY,
  MIDDLE_ENEMY,
  BLASTER_PROJECTILE_ID,
  SHOTGUN_PROJECTILE_ID,
  CIRCULAR_SAW_PROJECTILE_ID,
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
      projectileSpeed: 150,
    },
    {
      damage: 10,
      cooldown: 450,
      range: 160,
      projectileRadius: 4,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 150,
    },
    {
      damage: 15,
      cooldown: 400,
      range: 160,
      projectileRadius: 5,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 150,
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
      projectileSpeed: 175,
    },
    {
      damage: 3,
      cooldown: 500,
      range: 80,
      projectileQuantity: 5,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 4,
      cooldown: 500,
      range: 80,
      projectileQuantity: 6,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
  ],
  circularSaw: [
    {
      damage: 5,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 5000,
      changeDirectionCooldown: 2000,
      projectileRadius: 16,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
    {
      damage: 6,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 6000,
      changeDirectionCooldown: 2000,
      projectileRadius: 18,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
    {
      damage: 7,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 7000,
      changeDirectionCooldown: 200,
      projectileRadius: 20,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
  ],
};

export const ENEMIES = [
  {
    id: EASY_ENEMY, // easy
    ms: 5 * 60000,
    frequency: 3000
  },
  {
    id: MIDDLE_ENEMY, // middle
    ms: 3.5 * 60000,
    frequency: 4500
  },
  {
    id: HEAVY_ENEMY, // heavy
    ms: 2 * 60000,
    frequency: 6000
  },
];

