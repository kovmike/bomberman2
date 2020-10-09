import React, { useEffect } from "react";
import "./styles.css";
import { useStore } from "effector-react";
import {
  $monsters,
  moveMonsterFx,
  game,
  playerAPI,
  bombTimer,
  bangTimer
} from "./model";

export default function App() {
  const pG = useStore(game);
  const monsters = useStore($monsters);

  useEffect(() => {
    document.addEventListener("keypress", drive, false);
    const interval = setInterval(() => {
      //moveMonsterFx(monsters);
      bombTimer();
      bangTimer();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const moveM = () => {
    moveMonsterFx(monsters);
  };

  const moveP = () => {};

  const drive = (event) => {
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
    <div className="App" onKeyPress={drive}>
      {pG.map((row) => (
        <pre>{row.join``}</pre>
      ))}
      <button onClick={moveM}>move</button>
      <button onClick={moveP}>moveP</button>
    </div>
  );
}

// █
// ☢
// ☻
