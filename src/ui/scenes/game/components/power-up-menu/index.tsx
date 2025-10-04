import { useContext, useState, useEffect } from 'react';
import type { FC } from 'react';

import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';
import type { PlayerPowerUpEvent } from '../../../../../game/events';
import { Button } from '../../../../components';

import './style.css';

export const PowerUpMenu: FC = () => {
  const { world, scene } = useContext(EngineContext);

  const [visible, setVisible] = useState(false);
  const [bonuses, setBonuses] = useState<string[]>([]);

  useEffect(() => {
    const handlePlayerPowerUpEvent = (event: PlayerPowerUpEvent): void => {
      setVisible(true);
      setBonuses(event.bonuses);
    };

    world.addEventListener(EventType.PlayerPowerUp, handlePlayerPowerUpEvent);

    return (): void => {
      world.removeEventListener(
        EventType.PlayerPowerUp,
        handlePlayerPowerUpEvent,
      );
    };
  }, []);

  const handleConfirm = (bonus: string) => {
    if (!scene) {
      return;
    }

    setVisible(false);

    scene.dispatchEvent(EventType.PickPlayerPowerUp, { bonus });
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="power-up__overlay">
      <div className="power-up__content">
        <h1 className="power-up__title">Level Up</h1>
        {bonuses.map((bonus) => (
          <Button
            key={bonus}
            className="power-up__button"
            onClick={() => handleConfirm(bonus)}
          >
            {bonus}
          </Button>
        ))}
      </div>
    </div>
  );
};
