import React, { useEffect } from "react";
import "./styles.css";
import { useStore } from "effector-react";
import { moveMonster, game, playerAPI, bombTimer, bangTimer } from "./model";

export default function App() {
  const pG = useStore(game);

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
      {pG.map((row) => (
        <pre>{row.join``}</pre>
      ))}
      <div>You win</div>
      <div>You DIED!</div>
    </div>
  );
}

// █
// ☢
// ☻
