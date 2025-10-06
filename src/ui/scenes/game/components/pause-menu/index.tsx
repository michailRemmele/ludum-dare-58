import type { FC } from 'react';
import { Button } from '../../../../components';
import { useContext, useEffect, useState } from 'react';
import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';

import './style.css';

export const PauseMenu: FC = () => {
  const { world, scene } = useContext(EngineContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    world.addEventListener(EventType.Pause, showMenu);
  }, []);

  const handlePause = () => {
    scene.data.isPaused = false;
    setVisible(false);
  }

  const showMenu = () => {
    if (!scene.data.isGameOver && !scene.data.playPowerUpMenuShowed) {
      setVisible((prevState) => !prevState);
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <div className='pause-menu__overlay'>
      <div className='pause-menu'>
        <Button
          onClick={() => handlePause()}
        >
          Pause
        </Button>
      </div>
    </div>
  )
}
