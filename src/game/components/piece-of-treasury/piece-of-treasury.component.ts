import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface PieceOfTreasuryConfig {
  amount: number
}

@DefineComponent({
  name: 'PieceOfTreasury',
})
export default class PieceOfTreasury extends Component {
  @DefineField()
  amount: number;

  constructor(config: PieceOfTreasuryConfig) {
    super();

    const { amount } = config;

    this.amount = amount;
  }

  clone(): PieceOfTreasury {
    return new PieceOfTreasury({ amount: this.amount });
  }
}
