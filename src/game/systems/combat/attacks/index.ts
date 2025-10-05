import { BlasterAttack } from './blaster-attack';
import { ShotgunAttack } from './shotgun-attack';
import { CircularSawAttack } from './circular-saw-attack';
import { CollectorAuraAttack } from './collector-aura-attack';
import { RocketAttack } from './rocket-attack';
import { RicochetAttack } from './ricochet-attack';

import type { Attack } from './attack';

import type { Constructor } from '../../../../types/utils';

export type { Attack };

export const attacks: Record<string, Constructor<Attack>> = {
  blaster: BlasterAttack,
  shotgun: ShotgunAttack,
  circularSaw: CircularSawAttack,
  collectorAura: CollectorAuraAttack,
  rocket: RocketAttack,
  ricochet: RicochetAttack,
};
