import * as fs from "fs";

const Day10 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input10.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const getNeighbours = (layout: number[][], pos: [number, number]) => {
    const [i, j] = pos;
    const neighbours: [number, number][] = [];
    if (i > 0) neighbours.push([i-1, j]);
    if (i < layout.length - 1) neighbours.push([i+1, j]);
    if (j > 0) neighbours.push([i, j-1]);
    if (j < layout[0].length - 1) neighbours.push([i, j+1]);
    return neighbours;
  }

  const dfsIncrementalPath = (layout: number[][], start: [number, number], nextVal: number, visited: Set<string>, count: number, checkVisited: boolean) => {
    if (checkVisited && visited.has(`${start[0]}-${start[1]}`)) return count;
    visited.add(`${start[0]}-${start[1]}`);
    if (nextVal === 10) {
      return count + 1;
    }
    const neighbours = getNeighbours(layout, start);
    for (let neighbour of neighbours) {
      if (layout[neighbour[0]][neighbour[1]] === nextVal) {
        count = dfsIncrementalPath(layout, neighbour, nextVal + 1, visited, count, checkVisited);
      }
    };
    return count;
  }

  const solve = (inputStr: string) => {
    // 0. Parse input
    const layout = inputStr.split("\n").map(str => str.split("").map(c => {
      if (c === ".") return -1;
      return parseInt(c);
    }));
    // 1. Find all positions of 0
    const zeroPositions: [number, number][] = [];
    layout.forEach((row, i) => {
      row.forEach((col, j) => {
        if (col === 0) {
          zeroPositions.push([i, j]);
        }
      });
    });

    // 2. DFS from 0 to all connected 9s whle incrementally increasing from 0 to 9
    let count = 0
    zeroPositions.forEach(pos => {
      count += dfsIncrementalPath(layout, pos, 1, new Set<string>(), 0, true);
    });

    // 3. DFS and find all distinct paths for Part 2
    let countAll = 0
    zeroPositions.forEach(pos => {
      countAll += dfsIncrementalPath(layout, pos, 1, new Set<string>(), 0, false);
    });

    // 4. Count and return number of available paths
    return [count, countAll];

  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 9: Part 1 & Part 2: ", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day10();