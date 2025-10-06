import { Component } from 'dacha';
import { DefineComponent } from 'dacha-workbench/decorators';

export interface AttackState {
  level: number;
  cooldownRemaining: number;
}

export interface ModState {
  level: number;
}

export type Mode = 'frost' | 'poison' | 'explosion';

@DefineComponent({
  name: 'Weapon',
})
export default class Weapon extends Component {
  attacks: Map<string, AttackState>;
  mods: Map<string, Map<Mode, ModState>>;

  constructor() {
    super();

    this.attacks = new Map();
    this.mods = new Map();
  }

  clone(): Weapon {
    return new Weapon();
  }
}
