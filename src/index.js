import { using, h, spec, list } from "forest";
import {
  moveMonster,
  game,
  playerAPI,
  bombTimer,
  bangTimer,
  movePlayer,
  $winFlag,
  $loseFlag
} from "./model";

const interval = setInterval(() => {
  moveMonster();
  bombTimer();
  bangTimer();
}, 500);

const controls = (event) => {
  switch (event.keyCode) {
    case 97:
      movePlayer({ x: -1, y: 0 });
      break;
    case 119:
      movePlayer({ y: -1, x: 0 });
      break;
    case 115:
      movePlayer({ y: 1, x: 0 });
      break;
    case 100:
      movePlayer({ x: 1, y: 0 });
      break;
    case 32:
      playerAPI.setBomb();
      break;
    default:
      break;
  }
};
document.addEventListener("keypress", controls, false);

using(document.getElementById("root"), () => {
  h("p", {
    text: "controls - WASD, bomb - SPACE",
    style: { textAlign: "center" }
  });
  h("div", () => {
    spec({
      style: { textAlign: "center" }
    });

    list({
      source: game,
      fn({ store }) {
        h("pre", {
          text: store.map((str) => str.join``),
          style: { lineHeight: "0.3em" }
        });
      }
    });

    h("div", { text: "You win", visible: $winFlag });
    h("div", { text: "You DEAD!", visible: $loseFlag });
  });
});
