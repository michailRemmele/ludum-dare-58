import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface ScoreConfig {
  value: number;
}

@DefineComponent({
  name: 'Score',
})
export default class Score extends Component {
  @DefineField()
  value: number;

  constructor(config: ScoreConfig) {
    super();

    const { value } = config;

    this.value = value;
  }

  clone(): Score {
    return new Score({ value: this.value });
  }
}
