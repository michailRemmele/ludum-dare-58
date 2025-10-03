import { Component, Vector2 } from 'dacha';
import { DefineComponent, DefineField } from 'dacha-workbench/decorators';

interface MovementConfig {
  speed: number;
}

@DefineComponent({
  name: 'Movement',
})
export default class Movement extends Component {
  @DefineField()
  speed: number;

  maxSpeed: number;
  direction: Vector2;
  isMoving: boolean;
  isJumping: boolean;

  constructor(config: MovementConfig) {
    super();

    this.speed = config.speed;
    this.maxSpeed = config.speed;
    this.direction = new Vector2(0, 0);
    this.isMoving = false;
    this.isJumping = false;
  }

  clone(): Movement {
    return new Movement({
      speed: this.speed,
    });
  }
}
