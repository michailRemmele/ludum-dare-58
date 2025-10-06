import type { FC, ReactNode } from 'react';

import './style.css';

export interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  className = '',
}) => (
  <button className={`button ${className}`} type="button" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);
