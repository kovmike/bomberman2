import React, { useEffect } from "react";
import "./styles.css";
import { useStore } from "effector-react";
import {
  moveMonster,
  game,
  playerAPI,
  bombTimer,
  bangTimer,
  $winFlag,
  $loseFlag
} from "./model";

export default function App() {
  const pG = useStore(game);
  const winFlag = useStore($winFlag);
  const loseFlag = useStore($loseFlag);

  useEffect(() => {
    document.addEventListener("keypress", controls, false);
    const interval = setInterval(() => {
      moveMonster();
      bombTimer();
      bangTimer();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const controls = (event) => {
    switch (event.keyCode) {
      case 97:
        playerAPI.moveLeft();
        break;
      case 119:
        playerAPI.moveUp();
        break;
      case 115:
        playerAPI.moveDown();
        break;
      case 100:
        playerAPI.moveRight();
        break;
      case 32:
        playerAPI.setBomb();
        break;
      default:
        break;
    }
  };

  return (
    <div className="App" onKeyPress={controls}>
      <div>controls - WASD, bomb = SPACE </div>
      {pG.map((row) => (
        <pre>{row.join``}</pre>
      ))}
      {winFlag ? <div>You win</div> : null}
      {loseFlag ? <div>You DIED!</div> : null}
    </div>
  );
}

// █
// ☢
// ☻
