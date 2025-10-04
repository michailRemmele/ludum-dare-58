import { useContext, useState, useEffect } from 'react';
import type { FC } from 'react';

import { EngineContext } from '../../../../providers';
import * as EventType from '../../../../../game/events';
import type { UpdateTimerEvent } from '../../../../../game/events';

import './style.css';

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const TimerBar: FC = () => {
  const { world } = useContext(EngineContext);

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const handleUpdateTimer = (event: UpdateTimerEvent): void => {
      setTimer(event.timeLeft);
    };

    world.addEventListener(EventType.UpdateTimer, handleUpdateTimer);

    return (): void => {
      world.removeEventListener(EventType.UpdateTimer, handleUpdateTimer);
    };
  }, []);

  return <div className="timer-bar">{formatTime(timer)}</div>;
};
