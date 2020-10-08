export const defaultBomb = {
  planted: false,
  x: 0,
  y: 0,
  timer: 0
};

export const playGround = (n, m) => {
  return new Array(n).fill(" ").map((row, index) => {
    if (index === 0 || index === n - 1) return new Array(m).fill("█");
    return new Array(m).fill(" ").map((item, index) => {
      if (index === 0 || index === m - 1) return "█";
      return item;
    });
  });
};

export const addPlayer = (pG) => {
  pG[1][1] = "P";
  return pG;
};

export const monsters = (count, x, y) => {
  return new Array(count).fill(" ").map((_) => ({
    x: ~~(Math.random() * (x - 2)) + 1,
    y: ~~(Math.random() * (y - 2)) + 1,
    active: true
  }));
};
