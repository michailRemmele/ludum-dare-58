import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface ScorePointsConfig {
  amount: number;
}

@DefineComponent({
  name: 'ScorePoints',
})
export default class ScorePoints extends Component {
  @DefineField()
  amount: number;

  constructor(config: ScorePointsConfig) {
    super();

    const { amount } = config;

    this.amount = amount;
  }

  clone(): ScorePoints {
    return new ScorePoints({ amount: this.amount });
  }
}
