import { useContext, useState, useEffect } from 'react';
import type { FC } from 'react';

import Money from '../../../../../game/components/money/money.component';
import { PLAYER_ACTOR_NAME } from '../../../../../consts/actors';
import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';
import type { PlayerPowerUpEvent } from '../../../../../game/events';
import { Button } from '../../../../components';

import './style.css';

interface ModEntry {
  mod: string;
  bonus: string;
  level: number;
  cost: number;
}

export const PowerUpMenu: FC = () => {
  const { world, scene } = useContext(EngineContext);

  const [visible, setVisible] = useState(false);
  const [bonuses, setBonuses] = useState<{ bonus: string; level: number }[]>(
    [],
  );
  const [mod, setMod] = useState<ModEntry | undefined>();
  const [availableMoney, setAvailableMoney] = useState(0);

  useEffect(() => {
    const handlePlayerPowerUpEvent = (event: PlayerPowerUpEvent): void => {
      setVisible(true);
      setBonuses(event.bonuses);
      setMod(event.mod);

      const player = scene!.findChildByName(PLAYER_ACTOR_NAME)!;
      const money = player.getComponent(Money);

      setAvailableMoney(money.amount);
    };

    world.addEventListener(EventType.PlayerPowerUp, handlePlayerPowerUpEvent);

    return (): void => {
      world.removeEventListener(
        EventType.PlayerPowerUp,
        handlePlayerPowerUpEvent,
      );
    };
  }, []);

  const handleConfirm = (bonus: { bonus: string; level: number }) => {
    if (!scene) {
      return;
    }

    setVisible(false);

    scene.dispatchEvent(EventType.PickPlayerPowerUp, { bonus });
  };

  const handleBuy = (mod: ModEntry) => {
    if (!scene) {
      return;
    }

    if (availableMoney < mod.cost) {
      return;
    }

    scene.dispatchEvent(EventType.BuyMod, { mod });

    setMod(undefined);
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
            key={bonus.bonus}
            className="power-up__button"
            onClick={() => handleConfirm(bonus)}
          >
            {`${bonus.bonus} – ${bonus.level + 1}`}
          </Button>
        ))}
        {mod && (
          <Button
            key={mod.mod}
            className="power-up__button power-up__button_mod"
            onClick={() => handleBuy(mod)}
            disabled={availableMoney < mod.cost}
          >
            <span>{`${mod.bonus} – ${mod.mod} – ${mod.level + 1}`}</span>
            <span className="mod-cost">{mod.cost}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
