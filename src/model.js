import {
  createStore,
  createEffect,
  createEvent,
  combine,
  sample,
  createApi
} from "effector";
import { playGround, defaultBomb, monsters } from "./generate";

const DIMENSION = { x: 15, y: 85 };

const $emptyPG = createStore(playGround(DIMENSION.x, DIMENSION.y));
const $player = createStore({ x: 1, y: 1 });
export const $monsters = createStore(monsters(8, DIMENSION.x, DIMENSION.y));
export const $bomb = createStore(defaultBomb);

//$monsters.watch((s) => console.log(s));

// export const moveRight = createEvent();
// $player.on(moveRight, (pos, _) => ({ ...pos, x: pos.x + 1 }));
const bombPlanted = createEvent();

export const playerAPI = createApi($player, {
  moveLeft: (pos, n) => ({ ...pos, x: pos.x - n }),
  moveRight: (pos, n) => ({ ...pos, x: pos.x + n }),
  moveUp: (pos, n) => ({ ...pos, y: pos.y - n }),
  moveDown: (pos, n) => ({ ...pos, y: pos.y + n }),
  setBomb: () => bombPlanted()
});

sample({
  source: $player,
  clock: bombPlanted,
  fn: (plPos) => ({ planted: true, x: plPos.x, y: plPos.y, timer: 0 }),
  target: $bomb
});

//$player.watch((s) => console.log(s));
export const moveMonsterFx = createEffect((monsters) => {
  return monsters.map((monster) => {
    const randAxis = Math.round(Math.random()) === 1 ? "x" : "y";

    if (Math.round(Math.random()) === 1) {
      return monster[randAxis] + 1 === DIMENSION[randAxis] - 1
        ? monster
        : { ...monster, [randAxis]: (monster[randAxis] += 1) };
    }
    return monster[randAxis] - 1 < 1
      ? monster
      : { ...monster, [randAxis]: (monster[randAxis] -= 1) };
  });
});

$monsters.on(moveMonsterFx.doneData, (_, payload) => {
  return payload;
});

export const game = combine(
  $emptyPG,
  $player,
  $monsters,
  $bomb,
  (pG, player, monsters, bomb) => {
    for (let i = 1; i < pG.length - 1; i++) {
      for (let j = 1; j < pG[i].length - 1; j++) {
        pG[i][j] = " ";
      }
    }
    pG[player.y][player.x] = "P";
    for (let i = 0; i < monsters.length; i++) {
      pG[monsters[i]["x"]][monsters[i]["y"]] = "☻";
    }
    if (bomb.planted) pG[bomb.y][bomb.x] = "☢";
    return pG;
  }
);

// export const $pG = sample({
//   source: $emptyPG,
//   clock: $monsters,
//   fn: (pG, monsters) => {
//     //не нравится
//     for (let i = 1; i < pG.length - 1; i++) {
//       for (let j = 1; j < pG[i].length - 1; j++) {
//         if (pG[i][j] === "☻") pG[i][j] = " ";
//       }
//     }
//     for (let i = 0; i < monsters.length; i++) {
//       pG[monsters[i]["x"]][monsters[i]["y"]] = "☻";
//     }
//     return pG;
//   }
// });

//$pG.watch((s) => console.log(s));
