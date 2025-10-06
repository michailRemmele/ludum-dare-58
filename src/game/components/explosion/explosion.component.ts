import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface ExplosionConfig {
  radius: number;
  damage: number;
}

@DefineComponent({
  name: 'Explosion',
})
export default class Explosion extends Component {
  @DefineField()
  radius: number;

  @DefineField()
  damage: number;

  constructor(config: ExplosionConfig) {
    super();

    const { radius, damage } = config;

    this.radius = radius;
    this.damage = damage;
  }

  clone(): Explosion {
    return new Explosion({ radius: this.radius, damage: this.damage });
  }
}
