import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface FrostConfig {
  duration: number;
  slowFactor: number;
}

@DefineComponent({
  name: 'Frost',
})
export default class Frost extends Component {
  @DefineField()
  duration: number;

  @DefineField()
  slowFactor: number;

  durationRemaining: number;

  constructor(config: FrostConfig) {
    super();

    const { duration, slowFactor } = config;

    this.duration = duration;
    this.slowFactor = slowFactor;

    this.durationRemaining = 0;
  }

  clone(): Frost {
    return new Frost({ duration: this.duration, slowFactor: this.slowFactor });
  }
}
