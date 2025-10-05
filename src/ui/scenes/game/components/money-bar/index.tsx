import { useContext, useEffect, useState } from 'react';
import { EngineContext } from '../../../../providers';
import { PLAYER_ACTOR_NAME } from '../../../../../consts/actors.ts';
import type { UpdateMoneyEvent } from '../../../../../game/events';
import * as EventType from '../../../../../game/events';
import Money from '../../../../../game/components/money/money.component.ts';
import './styles.css';

export const MoneyBar = () => {
  const { world, scene } = useContext(EngineContext);

  const [reward, setReward] = useState(0);

  useEffect(() => {
    if (!scene) {
      return;
    }

    const actor = scene.findChildByName(PLAYER_ACTOR_NAME);
    const money = actor?.getComponent(Money);

    if (money) {
      setReward(money.amount);
    }
  }, [scene]);

  useEffect(() => {
    const handleUpdateMoney = (event: UpdateMoneyEvent): void => {
      setReward(event.amount);
    };

    world.addEventListener(EventType.UpdateReward, handleUpdateMoney);

    return (): void => {
      world.removeEventListener(EventType.UpdateReward, handleUpdateMoney);
    };
  }, []);

  return (
    <div className="money-bar">
      {reward}
    </div>
  );
}
