import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface PoisonConfig {
  duration: number;
  frequency: number;
  damage: number;
}

@DefineComponent({
  name: 'Poison',
})
export default class Poison extends Component {
  @DefineField()
  duration: number;

  @DefineField()
  frequency: number;

  @DefineField()
  damage: number;

  durationRemaining: number;

  constructor(config: PoisonConfig) {
    super();

    const { duration, frequency, damage } = config;

    this.duration = duration;
    this.frequency = frequency;
    this.damage = damage;

    this.durationRemaining = 0;
  }

  clone(): Poison {
    return new Poison({
      duration: this.duration,
      frequency: this.frequency,
      damage: this.damage,
    });
  }
}
