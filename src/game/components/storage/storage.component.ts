import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface StorageConfig {
  amount: number
}

@DefineComponent({
  name: 'Storage',
})
export default class Storage extends Component {
  @DefineField()
  amount: number;

  constructor(config: StorageConfig) {
    super();

    const { amount } = config;

    this.amount = amount;
  }

  clone(): Storage {
    return new Storage({ amount: this.amount });
  }
}
