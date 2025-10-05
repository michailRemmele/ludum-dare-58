import { BlasterAttack } from './blaster-attack';
import { ShotgunAttack } from './shotgun-attack';

import type { Attack } from './attack';

import type { Constructor } from '../../../../types/utils';

export type { Attack };

export const attacks: Record<string, Constructor<Attack>> = {
  blaster: BlasterAttack,
  shotgun: ShotgunAttack,
};
