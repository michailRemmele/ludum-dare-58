import { useContext, useState, useEffect } from 'react';
import type { FC } from 'react';

import { TREASURY_ACTOR_NAME } from '../../../../../consts/actors';
import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';
import type { UpdateMoneyEvent } from '../../../../../game/events';
import Storage from '../../../../../game/components/storage/storage.component';

import './style.css';

export const HpBar: FC = () => {
  const { world, scene } = useContext(EngineContext);

  const [points, setPoints] = useState(100);
  const [maxPoints, setMaxPoints] = useState(100);

  useEffect(() => {
    if (!scene) {
      return;
    }

    const treasury = scene.findChildByName(TREASURY_ACTOR_NAME);
    const storage = treasury?.getComponent(Storage);

    if (storage) {
      setMaxPoints(storage.amount);
    }
  }, [scene]);

  useEffect(() => {
    const handleUpdateMoney = (event: UpdateMoneyEvent): void => {
      setPoints(Math.max(0, event.amount));
    };

    world.addEventListener(EventType.UpdateMoney, handleUpdateMoney);

    return (): void => {
      world.removeEventListener(EventType.UpdateMoney, handleUpdateMoney);
    };
  }, []);

  return (
    <div className="hp-bar">
      <div
        className="hp-bar__points"
        style={{
          width: `${maxPoints ? (points / maxPoints) * 100 : 0}%`,
        }}
      />
    </div>
  );
};
