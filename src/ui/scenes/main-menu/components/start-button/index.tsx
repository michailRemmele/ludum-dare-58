import { Button } from '../../../../components';
import { ExitScene, LoadScene } from 'dacha/events';
import { useContext } from 'react';
import { EngineContext } from '../../../../providers';
import { LEVELS } from '../../../../../consts/game.ts';

export const StartButton = () => {
  const { world } = useContext(EngineContext);
  const handlePlay = (levelId: string): void => {
    world.dispatchEvent(ExitScene, { autoDestroy: false });
    world.dispatchEvent(LoadScene, {
      id: levelId,
    });
  };
  return (
    <Button
      className="main-menu__button"
      onClick={() => handlePlay(LEVELS[0].id)}
    >
      {LEVELS[0].title}
    </Button>
  )
}
