import { RangeAttack } from './range-attack';

import type { Attack } from './attack';

import type { Constructor } from '../../../../types/utils';

export type { Attack };

export const attacks: Record<string, Constructor<Attack>> = {
  baseRange: RangeAttack,
};
