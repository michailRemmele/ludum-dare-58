import { Component } from 'dacha';
import { DefineComponent } from 'dacha-workbench/decorators';

export interface AttackState {
  level: number;
  cooldownRemaining: number;
}

@DefineComponent({
  name: 'Weapon',
})
export default class Weapon extends Component {
  attacks: Map<string, AttackState>;

  constructor() {
    super();

    this.attacks = new Map();
  }

  clone(): Weapon {
    return new Weapon();
  }
}
