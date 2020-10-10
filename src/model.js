import {
  createStore,
  createEvent,
  combine,
  sample,
  createApi,
  guard
} from "effector";
import { playGround, monsters } from "./generate";

const DIMENSION = { x: 85, y: 15 };

const $emptyPG = createStore(playGround(DIMENSION.x, DIMENSION.y));
const $player = createStore({ x: 1, y: 1 });
const $bangStack = createStore([]);
export const $monsters = createStore(monsters(8, DIMENSION.x, DIMENSION.y));
export const $bombStack = createStore([]);
export const $winFlag = createStore(false);
export const $loseFlag = createStore(false);

// $monsters.watch((s) => console.log(s));
// $player.watch(s=>console.log(s));
// $emptyPG.watch((s) => console.log(s));
// $bangStack.watch(s=>console.log(s));
// $bombStack.watch((s) => console.log(s));

const bombPlanted = createEvent();
const bombAddedToStack = createEvent();
const bombExploded = createEvent();
const bombTimerTick = createEvent();
export const bombTimer = createEvent();
export const bangTimer = createEvent();
const showBang = createEvent();
const bangTimerTick = createEvent();
const bangDump = createEvent(); //конец показа взрыва
export const moveMonster = createEvent();
const monsterKilled = createEvent();
const youWin = createEvent();
const youLose = createEvent();

//
export const playerAPI = createApi($player, {
  moveLeft: (pos, _) => (pos.x - 1 >= 1 ? { ...pos, x: pos.x - 1 } : pos),
  moveRight: (pos, _) =>
    pos.x + 1 <= DIMENSION.x - 2 ? { ...pos, x: pos.x + 1 } : pos,
  moveUp: (pos, _) => (pos.y - 1 >= 1 ? { ...pos, y: pos.y - 1 } : pos),
  moveDown: (pos, _) =>
    pos.y + 1 <= DIMENSION.y - 2 ? { ...pos, y: pos.y + 1 } : pos,
  setBomb: () => bombPlanted()
});

/**** */
$monsters
  .on(monsterKilled, (stack, victim) =>
    stack.filter(
      (monster) => !(monster.x === victim.x && monster.y === victim.y)
    )
  )
  .on(moveMonster, (stack, _) =>
    stack.map((monster) => {
      const randAxis = Math.round(Math.random()) === 1 ? "x" : "y";
      if (Math.round(Math.random()) === 1) {
        return monster[randAxis] + 1 === DIMENSION[randAxis] - 1
          ? monster
          : { ...monster, [randAxis]: (monster[randAxis] += 1) };
      }
      return monster[randAxis] - 1 < 1
        ? monster
        : { ...monster, [randAxis]: (monster[randAxis] -= 1) };
    })
  );

$bombStack
  .on(bombTimerTick, (stack, _) =>
    stack.map((bomb) => ({ ...bomb, timer: bomb.timer + 1 }))
  )
  .on(bombAddedToStack, (stack, newBomb) => [...stack, newBomb])
  .on(bombExploded, (stack, _) => stack.filter((bomb) => bomb.timer < 6));

$bangStack
  .on(showBang, (stack, [bang]) => [
    ...stack,
    { timer: 0, x: bang.x, y: bang.y }
  ])
  .on(bangTimerTick, (stack, _) =>
    stack.map((bang) => ({ ...bang, timer: bang.timer + 1 }))
  )
  .on(bangDump, (stack, _) => stack.filter((bang) => bang.timer < 4));

$winFlag.on(youWin, (flag, _) => true);
$loseFlag.on(youLose, (flag, _) => true);

//установка бомбы
sample({
  source: $player,
  clock: bombPlanted,
  fn: (plPos) => ({ planted: true, x: plPos.x, y: plPos.y, timer: 0 }),
  target: bombAddedToStack
});

//запуск таймера бомбы
guard({
  source: sample($bombStack, bombTimer),
  filter: (bombStack) => bombStack.length > 0,
  target: bombTimerTick
});

//взрыв бомбы
sample({
  source: $bombStack,
  clock: bombTimerTick,
  fn: (bombStack) => bombStack.filter((bomb) => bomb.timer >= 6),
  target: bombExploded
});

//активация взрыва
guard({
  source: bombExploded,
  filter: (exp) => exp.length !== 0,
  target: showBang
});

//запуск таймера показа взрыва
guard({
  source: sample($bangStack, bangTimer),
  filter: (bangStack) => bangStack.length > 0,
  target: bangTimerTick
});

//конец показа взрыва
guard({
  source: $bangStack,
  filter: (bangStack) => bangStack.filter((bang) => bang.timer >= 4).length > 0,
  target: bangDump
});

//win
guard({
  source: $monsters,
  filter: (monsters) => monsters.length === 0,
  target: youWin
});
export const game = combine(
  $emptyPG,
  $player,
  $monsters,
  $bombStack,
  $bangStack,
  (emptyPG, player, monsters, bombStack, bangStack) => {
    let pG = emptyPG.map((line) => [...line]);

    pG[player.y][player.x] = "P";
    for (let i = 0; i < monsters.length; i++) {
      if (!monsters[i].active) console.log("hi");
      if (monsters[i].active) pG[monsters[i]["y"]][monsters[i]["x"]] = "☻";
    }

    bombStack.forEach((bomb) => {
      pG[bomb.y][bomb.x] = "B";
    });

    bangStack.forEach((bang) => {
      for (let i = 1; i < 4; i++) {
        if (bang.x + i < DIMENSION.x - 1) {
          if (pG[bang.y][bang.x + i] === " ") {
            pG[bang.y][bang.x + i] = "F";
          } else if (pG[bang.y][bang.x + i] === "☻") {
            monsterKilled({ y: bang.y, x: bang.x + i });
          }
        }

        if (bang.x - i > 0) {
          if (pG[bang.y][bang.x - i] === " ") {
            pG[bang.y][bang.x - i] = "F";
          } else if (pG[bang.y][bang.x - i] === "☻") {
            monsterKilled({ y: bang.y, x: bang.x - i });
          }
        }

        if (bang.y + i < DIMENSION.y - 1) {
          if (pG[bang.y + i][bang.x] === " ") {
            pG[bang.y + i][bang.x] = "F";
          } else if (pG[bang.y + i][bang.x] === "☻") {
            monsterKilled({ y: bang.y + i, x: bang.x });
          }
        }

        if (bang.y - i > 0) {
          if (pG[bang.y - i][bang.x] === " ") {
            pG[bang.y - i][bang.x] = "F";
          } else if (pG[bang.y - i][bang.x] === "☻") {
            monsterKilled({ y: bang.y - i, x: bang.x });
          }
        }
      }
    });

    return pG;
  }
);
//game.watch((s) => console.log(s));
