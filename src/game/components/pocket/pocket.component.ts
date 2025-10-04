import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface PocketConfig {
  size: number;
}

@DefineComponent({
  name: 'Pocket',
})
export default class Pocket extends Component {
  @DefineField()
  size: number;

  amount: number;

  constructor(config: PocketConfig) {
    super();

    const { size } = config;

    this.size = size;
    this.amount = 0;
  }

  clone(): Pocket {
    return new Pocket({ size: this.size });
  }
}
