import React, { useEffect } from "react";
import "./styles.css";
import { useStore } from "effector-react";
import {
  moveMonster,
  game,
  playerAPI,
  bombTimer,
  bangTimer,
  move,
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
        move({ x: -1, y: 0 });
        break;
      case 119:
        move({ y: -1, x: 0 });
        break;
      case 115:
        move({ y: 1, x: 0 });
        break;
      case 100:
        move({ x: 1, y: 0 });
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
      <div>controls - WASD, bomb - SPACE </div>
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
