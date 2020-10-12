import {
  createStore,
  createEvent,
  combine,
  sample,
  createApi,
  guard,
  forward,
  split
} from "effector";
import { playGround, monsters, barrierGenerator } from "./generators";

const DIMENSION = { x: 85, y: 15 };

const $emptyPG = createStore(playGround(DIMENSION.x, DIMENSION.y));
const $player = createStore({ active: true, x: 1, y: 1 });
const $bangStack = createStore([]);
const $monsters = createStore(monsters(8, DIMENSION.x, DIMENSION.y));
const $bombStack = createStore([]);
const $boxStack = createStore(
  barrierGenerator(20, DIMENSION.x - 2, DIMENSION.y - 2)
);
const $wallStack = createStore(
  barrierGenerator(15, DIMENSION.x - 2, DIMENSION.y - 2)
);
const $winFlag = createStore(false);
const $loseFlag = createStore(false);

// $monsters.watch((s) => console.log(s));
// $player.watch(s=>console.log(s));
// $emptyPG.watch((s) => console.log(s));
// $bangStack.watch(s=>console.log(s));
// $bombStack.watch((s) => console.log(s));
// $boxStack.watch((s) => console.log(s));

const move = createEvent();
const positionChanged = createEvent();
const bombPlanted = createEvent();
const bombAddedToStack = createEvent();
const bombExploded = createEvent();
const bombTimerTick = createEvent();
const bombTimer = createEvent();
const bangTimer = createEvent();
const showBang = createEvent();
const bangTimerTick = createEvent();
const bangDump = createEvent(); //конец показа взрыва
const moveMonster = createEvent();
const newMonsterStack = createEvent();
const monsterKilled = createEvent();
const youWin = createEvent();
const youLose = createEvent();
const boxDestroyed = createEvent();
const playerDead = createEvent();

//
const playerAPI = createApi($player, {
  moveLeft: (pos, _) => (pos.x - 1 >= 1 ? { ...pos, x: pos.x - 1 } : pos),
  moveRight: (pos, _) =>
    pos.x + 1 <= DIMENSION.x - 2 ? { ...pos, x: pos.x + 1 } : pos,
  moveUp: (pos, _) => (pos.y - 1 >= 1 ? { ...pos, y: pos.y - 1 } : pos),
  moveDown: (pos, _) =>
    pos.y + 1 <= DIMENSION.y - 2 ? { ...pos, y: pos.y + 1 } : pos,
  setBomb: (pos, _) => (pos.active ? bombPlanted() : false)
});

/**** */

$monsters
  .on(monsterKilled, (stack, victim) =>
    stack.filter(
      (monster) => !(monster.x === victim.x && monster.y === victim.y)
    )
  )
  .on(newMonsterStack, (_, newStack) => newStack);

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

$boxStack.on(boxDestroyed, (stack, delBox) =>
  stack.filter((box) => !(box.x === delBox.x && box.y === delBox.y))
);
$winFlag.on(youWin, (flag, _) => true);
$loseFlag.on(youLose, (flag, _) => true);
$player.on(playerDead, (player, _) => ({ ...player, active: false }));

//движение монстров
sample({
  source: { $monsters, $boxStack, $wallStack },
  clock: moveMonster,
  fn: ({ $monsters, $boxStack, $wallStack }, _) => {
    return $monsters.map((monster) => {
      const randAxis = Math.round(Math.random()) === 1 ? "x" : "y";
      const checkBarrier = (unmovedMonster, axis, delta) => {
        const movedMonster = {
          ...unmovedMonster,
          [axis]: unmovedMonster[axis] + delta
        };
        if (
          $boxStack.some(
            (box) => box.x === movedMonster.x && box.y === movedMonster.y
          ) ||
          $wallStack.some(
            (wall) => wall.x === movedMonster.x && wall.y === movedMonster.y
          )
        )
          return unmovedMonster;
        return movedMonster;
      };

      if (Math.round(Math.random()) === 1) {
        if (monster[randAxis] + 1 !== DIMENSION[randAxis] - 1) {
          return checkBarrier(monster, randAxis, 1);
        }
        return monster;
      } else {
        if (monster[randAxis] - 1 > 1) {
          return checkBarrier(monster, randAxis, -1);
        }
        return monster;
      }
    });
  },
  target: newMonsterStack
});

//движение игрока
//препятствия
sample({
  source: { $player, $boxStack, $wallStack },
  clock: move,
  fn: ({ $player, $boxStack, $wallStack }, move) => {
    if (
      $boxStack.some(
        (box) => box.x === $player.x + move.x && box.y === $player.y + move.y
      ) ||
      $wallStack.some(
        (wall) => wall.x === $player.x + move.x && wall.y === $player.y + move.y
      )
    )
      return { x: 0, y: 0 };
    return { x: move.x, y: move.y };
  },
  target: positionChanged
});

split({
  source: positionChanged,
  match: {
    left: (pos) => pos.x === -1,
    right: (pos) => pos.x === 1,
    up: (pos) => pos.y === -1,
    down: (pos) => pos.y === 1
  },
  cases: {
    left: playerAPI.moveLeft,
    right: playerAPI.moveRight,
    up: playerAPI.moveUp,
    down: playerAPI.moveDown
  }
});

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
  filter: (bangStack) => bangStack.some((bang) => bang.timer >= 4),
  target: bangDump
});

//win
guard({
  source: $monsters,
  filter: (monsters) => monsters.length === 0,
  target: youWin
});

//lose
forward({
  from: youLose,
  to: playerDead
});

const game = combine(
  $emptyPG,
  $boxStack,
  $wallStack,
  $player,
  $monsters,
  $bombStack,
  $bangStack,

  (emptyPG, boxStack, wallStack, player, monsters, bombStack, bangStack) => {
    let pG = emptyPG.map((line) => [...line]);

    boxStack.forEach((box) => (pG[box.y][box.x] = "□"));
    wallStack.forEach((wall) => (pG[wall.y][wall.x] = "█"));

    if (player.active) pG[player.y][player.x] = "P";

    for (let i = 0; i < monsters.length; i++) {
      if (
        monsters[i]["y"] === player.y &&
        monsters[i]["x"] === player.x &&
        player.active
      )
        youLose();
      if (monsters[i].active) pG[monsters[i]["y"]][monsters[i]["x"]] = "☻";
    }

    bombStack.forEach((bomb) => {
      pG[bomb.y][bomb.x] = "*";
    });

    const checkForExpl = (x, y) => {
      if (pG[x][y] === " ") {
        pG[x][y] = "+";
      } else if (pG[x][y] === "☻") {
        //хитрый ход
        monsterKilled({ x: y, y: x });
      } else if (pG[x][y] === "□") {
        boxDestroyed({ x: y, y: x });
      } else if (pG[x][y] === "P") {
        youLose();
      }
    };

    const checkWallBarrier = (x, y) => {
      return pG[x][y] === "█";
    };

    bangStack.forEach((bang) => {
      let wallBarrierUp = false;
      let wallBarrierDown = false;
      let wallBarrierRight = false;
      let wallBarrierLeft = false;
      for (let i = 1; i < 4; i++) {
        if (bang.x + i < DIMENSION.x - 1) {
          if (!wallBarrierRight)
            wallBarrierRight = checkWallBarrier(bang.y, bang.x + i);
          if (!wallBarrierRight) checkForExpl(bang.y, bang.x + i);
        }
        if (bang.x - i > 0) {
          if (!wallBarrierLeft)
            wallBarrierLeft = checkWallBarrier(bang.y, bang.x - i);
          if (!wallBarrierLeft) checkForExpl(bang.y, bang.x - i);
        }
        if (bang.y + i < DIMENSION.y - 1) {
          if (!wallBarrierDown)
            wallBarrierDown = checkWallBarrier(bang.y + i, bang.x);
          if (!wallBarrierDown) checkForExpl(bang.y + i, bang.x);
        }
        if (bang.y - i > 0) {
          if (!wallBarrierUp)
            wallBarrierUp = checkWallBarrier(bang.y - i, bang.x);
          if (!wallBarrierUp) checkForExpl(bang.y - i, bang.x);
        }
      }
    });

    return pG;
  }
);

export {
  game,
  $winFlag,
  $loseFlag,
  move,
  bombTimer,
  bangTimer,
  moveMonster,
  playerAPI
};
