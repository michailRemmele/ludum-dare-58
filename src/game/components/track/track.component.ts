import { Component, type TemplateConfig } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface TrackConfig {
  mob: string,
  frequency: number,
  maxNumber: number
}

@DefineComponent({
  name: 'Track',
})
export default class Track extends Component {
  @DefineField({
    type: 'select',
    options: (getState) => getState(['templates'] as TemplateConfig).map(
      (config) => ({ title: config.name, value: config.id })
    )
  })
  mob: string;

  @DefineField({
    initialValue: 1000,
  })
  frequency: number;

  @DefineField()
  maxNumber: number;

  constructor(config: TrackConfig) {
    super();

    const { mob, frequency, maxNumber } = config;

    this.mob = mob;
    this.frequency = frequency;
    this.maxNumber = maxNumber;
  }

  clone(): Track {
    return new Track({ mob: this.mob, frequency: this.frequency, maxNumber: this.maxNumber });
  }
}
