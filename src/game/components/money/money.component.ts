import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface MoneyConfig {
  amount: number,
  canLiftMoney: boolean
}

@DefineComponent({
  name: 'Money',
})
export default class Money extends Component {
  @DefineField()
  amount: number;

  @DefineField()
  canLiftMoney: boolean;

  constructor(config: MoneyConfig) {
    super();

    const { amount, canLiftMoney } = config;

    this.amount = amount;
    this.canLiftMoney = canLiftMoney;
  }

  clone(): Money {
    return new Money({ amount: this.amount, canLiftMoney: this.canLiftMoney });
  }
}
