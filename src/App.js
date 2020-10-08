import React, { useEffect } from "react";
import "./styles.css";
//import {playGround, addPlayer} from './generate'
import { useStore } from "effector-react";
import { $monsters, moveMonsterFx, game, playerAPI } from "./model";

export default function App() {
  const pG = useStore(game);
  const monsters = useStore($monsters);

  useEffect(() => {
    document.addEventListener("keypress", drive, false);
    // const interval = setInterval(() => {
    //   moveMonsterFx(monsters);
    // }, 500);
    // return () => clearInterval(interval);
  }, []);

  const moveM = () => {
    moveMonsterFx(monsters);
  };

  const moveP = () => {};

  const drive = (event) => {
    //console.log(event.keyCode);
    switch (event.keyCode) {
      case 97:
        playerAPI.moveLeft(1);
        break;
      case 119:
        playerAPI.moveUp(1);
        break;
      case 115:
        playerAPI.moveDown(1);
        break;
      case 100:
        playerAPI.moveRight(1);
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
