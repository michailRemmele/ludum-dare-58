import { Component } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface TrackSegmentConfig {
  index: string
}

@DefineComponent({
  name: 'TrackSegment',
})
export default class TrackSegment extends Component {
  @DefineField()
  index: string;

  constructor(config: TrackSegmentConfig) {
    super();

    const { index } = config;

    this.index = index;
  }

  clone(): TrackSegment {
    return new TrackSegment({ index: this.index });
  }
}
