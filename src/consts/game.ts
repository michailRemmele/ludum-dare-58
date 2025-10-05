import { LEVEL_1_ID } from './scenes';
import {
  EASY_ENEMY,
  HEAVY_ENEMY,
  MIDDLE_ENEMY,
  ELITE_ENEMY,
  BLASTER_PROJECTILE_ID,
  SHOTGUN_PROJECTILE_ID,
  CIRCULAR_SAW_PROJECTILE_ID,
  COLLECTOR_AURA_PROJECTILE_ID,
} from './templates';

export const LEVEL_UP_BASE_STEP = 500;
export const MAX_LEVEL = 18;

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
    {
      damage: 20,
      cooldown: 400,
      range: 160,
      projectileRadius: 5,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 150,
    },
    {
      damage: 25,
      cooldown: 400,
      range: 160,
      projectileRadius: 6,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 150,
    },
    {
      damage: 30,
      cooldown: 400,
      range: 160,
      projectileRadius: 6,
      projectileModel: BLASTER_PROJECTILE_ID,
      projectileSpeed: 150,
    },
  ],
  shotgun: [
    {
      damage: 2,
      cooldown: 500,
      range: 80,
      projectileQuantity: 3,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 4,
      cooldown: 500,
      range: 80,
      projectileQuantity: 4,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 6,
      cooldown: 500,
      range: 80,
      projectileQuantity: 5,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 8,
      cooldown: 500,
      range: 80,
      projectileQuantity: 6,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 10,
      cooldown: 500,
      range: 80,
      projectileQuantity: 7,
      projectileRadius: 4,
      projectileModel: SHOTGUN_PROJECTILE_ID,
      projectileSpeed: 175,
    },
    {
      damage: 12,
      cooldown: 500,
      range: 80,
      projectileQuantity: 8,
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
      changeDirectionCooldown: 2000,
      projectileRadius: 20,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
    {
      damage: 8,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 8000,
      changeDirectionCooldown: 2000,
      projectileRadius: 22,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
    {
      damage: 9,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 8000,
      changeDirectionCooldown: 2000,
      projectileRadius: 24,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
    {
      damage: 10,
      damageFrequency: 500,
      cooldown: 3000,
      duration: 8000,
      changeDirectionCooldown: 2000,
      projectileRadius: 26,
      projectileModel: CIRCULAR_SAW_PROJECTILE_ID,
      projectileSpeed: 25,
    },
  ],
  collectorAura: [
    {
      radius: 16,
      cooldown: 20 * 60 * 1000,
      projectileModel: COLLECTOR_AURA_PROJECTILE_ID,
    },
  ],
};

export const SPAWN_INCREASE_MULTIPLIER = 2;
export const SPAWN_INCREASE_FREQUENCY_COOLDOWN = 1 * 60 * 1000;

export const ENEMIES = [
  {
    id: EASY_ENEMY,
    ms: 10 * 60 * 1000,
    frequency: 2000,
  },
  {
    id: MIDDLE_ENEMY,
    ms: 7.5 * 60 * 1000,
    frequency: 2000,
  },
  {
    id: HEAVY_ENEMY,
    ms: 5 * 60 * 1000,
    frequency: 2000,
  },
  {
    id: ELITE_ENEMY,
    ms: 2.5,
    frequency: 2000,
  },
];
