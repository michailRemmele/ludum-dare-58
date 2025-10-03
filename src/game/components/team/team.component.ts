import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface TeamConfig {
  index: number;
}

@DefineComponent({
  name: 'Team',
})
export default class Team extends Component {
  @DefineField()
  index: number;

  constructor(config: TeamConfig) {
    super();

    const { index } = config;

    this.index = index;
  }

  clone(): Team {
    return new Team({ index: this.index });
  }
}
