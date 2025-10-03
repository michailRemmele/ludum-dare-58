const SMOOTH_TIME = 0.05;

export const smoothMove = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  deltaTime: number,
): [number, number] => {
  let t = SMOOTH_TIME * deltaTime;
  t = Math.min(t, 1);

  const x = currentX + (targetX - currentX) * t;
  const y = currentY + (targetY - currentY) * t;

  return [x, y];
};
