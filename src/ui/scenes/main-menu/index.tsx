import { useState } from 'react';
import type { FC } from 'react';

import { Main, Settings } from './components';
import { MAIN_MENU, SETTINGS_MENU } from './consts';
import './style.css';

export const MainMenu: FC = () => {
  const [menuState, setMenuState] = useState(MAIN_MENU);

  return (
    <div className="menu">
      <img
        src="./images/logo.png"
        alt="Ludum Dare 58"
        className="menu__logo"
      />
      {menuState === MAIN_MENU && <Main openMenu={setMenuState} />}
      {menuState === SETTINGS_MENU && <Settings openMenu={setMenuState} />}
    </div>
  );
};
