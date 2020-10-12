export const playGround = (n, m) => {
  return new Array(m).fill(" ").map((row, index) => {
    if (index === 0 || index === m - 1) return new Array(n).fill("█");
    return new Array(n).fill(" ").map((item, index) => {
      if (index === 0 || index === n - 1) return "█";
      return item;
    });
  });
};

export const barrierGenerator = (count, maxX, maxY) => {
  return new Array(count).fill("").map((_) => ({
    x: ~~(Math.random() * maxX) + 1,
    y: ~~(Math.random() * maxY) + 1
  }));
};

export const monsters = (count, x, y) => {
  return new Array(count).fill(" ").map((_) => ({
    x: ~~(Math.random() * (x - 2)) + 1,
    y: ~~(Math.random() * (y - 2)) + 1,
    active: true
  }));
};
