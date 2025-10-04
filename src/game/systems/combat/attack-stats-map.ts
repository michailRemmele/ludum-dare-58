import { PROJECTILE_MODEL_ID } from '../../../consts/templates';

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
  ],
};
