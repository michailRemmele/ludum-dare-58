import { useContext, useState, useEffect } from 'react';
import type { FC } from 'react';

import { LEVEL_UP_BASE_STEP } from '../../../../../consts/game';
import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';
import type { IncreaseScorePointsEvent, LevelUpEvent } from '../../../../../game/events';

import './style.css';

export const ExpBar: FC = () => {
  const { world } = useContext(EngineContext);

  const [points, setPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(LEVEL_UP_BASE_STEP);
  const [prevMaxPoints, setPrevMaxPoints] = useState(0);
  const [isMaxLevel, setIsMaxLevel] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);

  useEffect(() => {
    const handleIncreaseScorePoints = (event: IncreaseScorePointsEvent): void => {
      setPoints((prev) => prev + event.points);
    };
    const handleLevelUp = (event: LevelUpEvent): void => {
      setPrevMaxPoints(event.nextLevelScore - event.level * LEVEL_UP_BASE_STEP);
      setMaxPoints(event.nextLevelScore);
      setIsMaxLevel(event.isMax);
      setPlayerLevel(event.level);
    };

    world.addEventListener(EventType.IncreaseScorePoints, handleIncreaseScorePoints);
    world.addEventListener(EventType.LevelUp, handleLevelUp);

    return (): void => {
      world.removeEventListener(EventType.IncreaseScorePoints, handleIncreaseScorePoints);
      world.removeEventListener(EventType.LevelUp, handleLevelUp);
    };
  }, []);

  const fixedPoints = points - prevMaxPoints;
  const fixedMaxPoints = maxPoints - prevMaxPoints;

  return (
    <div className="exp-bar">
      <div
        className="exp-bar__points"
        style={{
          width: !isMaxLevel ? `${fixedMaxPoints ? ((fixedPoints / fixedMaxPoints) * 100) : 0}%` : '100%',
        }}
      />
      <span className="exp-bar__label">{`Lvl. ${playerLevel}`}</span>
    </div>
  );
};
