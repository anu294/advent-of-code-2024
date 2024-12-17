import * as fs from "fs";

const Day15 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input15.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const GOODS = "O";
  const GOODS_LEFT = "[";
  const GOODS_RIGHT = "]";
  const WALL = "#";
  const SPACE = ".";
  const BOT = "@";
  
  type Pos = [number, number];
  const directions = ["^", "v", "<", ">"] as const;

  type Dirs = typeof directions[number];
  const Direction: Record<Dirs, [number, number]> = {
    "v": [1, 0],
    "^": [-1, 0],
    "<": [0, -1],
    ">": [0, 1],
  }
  const findPositonOfCharIn2DArray = (char: string, matrix: string[][]): Pos => {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === char) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  }

  const parseInputLayoutAndMoves = (inputStr: string) => {
    const layoutStr = inputStr.split("\n\n")[0];
    const movesStr = inputStr.split("\n\n")[1];
    const layout = layoutStr.split("\n").map((x) => x.split("").map((y) => y));
    const moves: Dirs[] = movesStr.split("\n").reduce((acc, moveSubStr) => { acc += moveSubStr; return acc} , "").split("") as Dirs[];
    // find position of BOT in layout
    const startPos = findPositonOfCharIn2DArray(BOT, layout);
    return {layout, moves, startPos};
  }
  
  const isWall = (layout: string[][], pos: Pos): boolean => {
    const [x, y] = pos;
    if (!layout[x]?.[y] || layout[x]?.[y] === WALL) {
      return true;
    }
    return false;
  }


  const findFreeSpaceInDirection = (layout: string[][], botPos: Pos, move: Dirs): Pos => {
    const [x, y] = botPos;
    const [dx, dy] = Direction[move];
    let [nx, ny]: Pos = [x + dx, y + dy];
    while (layout[nx]?.[ny] !== SPACE && layout[nx]?.[ny] !== WALL) {
      nx += dx;
      ny += dy;
    }

    if(isWall(layout, [nx, ny])) {
      return botPos;
    }
    return [nx, ny];
  }

  const findGoodsThatWillMove = (layout: string[][], botPos: Pos, move: Dirs): Pos[] => {
    const goodsToMove: Pos[] = [], queue: Pos[] = [botPos], visited: Set<string> = new Set();
    const [dx, dy] = Direction[move];
    let canMove = true;
    while (queue.length > 0) {
      const [cx, cy] = queue.shift() as Pos;
      if (visited.has(`${cx},${cy}`)) {
        continue;
      }
      visited.add(`${cx},${cy}`);
      if (layout[cx]?.[cy] === GOODS || layout[cx]?.[cy] === BOT) {
        queue.push([cx + dx, cy + dy]);
      }
      else if (layout[cx]?.[cy] === GOODS_LEFT) {
        queue.push([cx + dx, cy + dy]);
        queue.push([cx, cy + 1]);
      }
      else if (layout[cx]?.[cy] === GOODS_RIGHT) {
        queue.push([cx + dx, cy + dy]);
        queue.push([cx, cy - 1]);
      }
      else if (layout[cx]?.[cy] === SPACE)
        continue;
      else if (layout[cx]?.[cy] === WALL) {
        canMove = false;
        break;
      }
      goodsToMove.push([cx, cy]);
    }

    return canMove ? goodsToMove : [];
  }

  const move = (layout: string[][], botPos:Pos, move: Dirs, steps: number) => {
    const [x, y] = botPos, [dx, dy] = Direction[move];
    let [bx, by] = [x , y];
    let [nx, ny]: Pos = [x + dx, y + dy];
    const layoutOriginal = layout.map((row) => [...row]);

    for (let i = 0; i < steps; i++) {
      [nx, ny] = findFreeSpaceInDirection(layout, botPos, move);
    }

    const goodsThatMove = findGoodsThatWillMove(layout, botPos, move);
    // Move the goods in the direction
    goodsThatMove.reverse().forEach((pos) => {
      const [gx, gy] = pos;
      const symbol = layoutOriginal[gx][gy]; // Could be Goods, GoodsLeft, GoodsRight or even bot
      layout[gx][gy] = SPACE;
      layout[gx + dx][gy + dy] = symbol;
      if (symbol === BOT) {
        [bx, by] = [gx + dx, gy + dy];
      }
      
    });
    // // get change in position as number of steps
    // const [cx, cy] = [nx - x, ny - y];
    // const numOfChanges = Math.abs(cx) + Math.abs(cy);
    // if (numOfChanges === 0) {
    //   return {layout, botPos};
    // }
    // // console.log("New Position: ", nx, ny, "numOfChanges: ", numOfChanges);
    // // bot position after steps
    // // First move the bot to the new position
    // for (let i = 0; i <= numOfChanges; i++) {
    //   const [ix, iy] = [x + (i * dx), y + (i * dy)];
    //   if (i < steps) {
    //     layout[ix][iy] = SPACE;
    //   }
    //   else if (i === steps) {
    //     layout[ix][iy] = BOT;
    //     [bx, by] = [ix, iy];
    //   }
    //   else {
    //     layout[ix][iy] = GOODS;
    //   }
    // }
    //console.log(layout.map(row => row.join("")).join("\n"));
    //console.log("__________________\n\n")

    // Then move the remaining changes with goods ie "0"
      
    return {layout, botPos: [bx, by]};
  }

  const calcGPS = (layout: string[][]) => {
    let score = 0;
    for (let i = 0; i < layout.length; i++) {
      for (let j = 0; j < layout[i].length; j++) {
        if (layout[i][j] === GOODS || layout[i][j] === GOODS_LEFT) {
          score += (i*100)+j;
        }
      }
    }
    return score;
  }

  const zoomIn = (layout: string[][]) => {
    const factor = 2;
    const zLayout: string[][] = [];
    for (let i = 0; i < layout.length; i++) {
      zLayout.push([]);
      for (let j = 0; j < layout[i].length; j++) {
        if (layout[i][j] === GOODS) {
          zLayout[i].push(GOODS_LEFT);
          zLayout[i].push(GOODS_RIGHT);
        }
        else if (layout[i][j] === WALL) {
          zLayout[i].push(WALL)
          zLayout[i].push(WALL);
        }
        else if (layout[i][j] === BOT) {
          zLayout[i].push(BOT);
          zLayout[i].push(SPACE);
        }
        else {
          zLayout[i].push(SPACE);
          zLayout[i].push(SPACE);
        }
      }
    }
    return zLayout;
  }

  const solve1 = (inputStr: string) => {
    // 0. Parse input
    let {layout, moves} = parseInputLayoutAndMoves(inputStr);
    let [x, y] = findPositonOfCharIn2DArray(BOT, layout);
    
    // 1. Iterate over moves and call the move fn
    moves.forEach((m) => {
      const {layout: newLayout, botPos} = move(layout, [x, y], m, 1);
      layout = newLayout;
      [x, y] = botPos;
    });

    // 2. Calculate the GPS of all goods
    const gpsScore = calcGPS(layout);
    return gpsScore;
  }

  const solve2 = (inputStr: string) => {
    // 0. Parse input
    let {layout, moves} = parseInputLayoutAndMoves(inputStr);
    // 1. Zoom in the layout by factor of 2
    layout = zoomIn(layout);
    let [x, y] = findPositonOfCharIn2DArray(BOT, layout);
    // console.log(layout.map(row => row.join("")).join("\n"));
    // 2. Iterate over moves and call the move fn
    moves.forEach((m) => {
      const {layout: newLayout, botPos} = move(layout, [x, y], m, 1);
      layout = newLayout;
      [x, y] = botPos;
    });
    // 3. Calculate the GPS of all goods
    const gpsScore = calcGPS(layout);
    return gpsScore;

  }

  const main = (inputString: string) => {
    console.time();
    console.log("Day 15: Part 1: ", solve1(inputString));
    console.log("Day 15: Part 2: ", solve2(inputString));
    console.timeEnd();
  };

  readInput();
};

Day15();