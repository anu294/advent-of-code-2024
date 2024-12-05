import _ from "lodash";
import * as fs from "fs";

const Day1 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input4.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type Matrix = string[][];
  const directions = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"] as const;

  type Dirs = typeof directions[number];
  const Direction: Record<Dirs, [number, number]> = {
    "S": [1, 0],
    "N": [-1, 0],
    "W": [0, -1],
    "E": [0, 1],
    "NW": [-1, -1],
    "NE": [-1, 1],
    "SW": [1, -1],
    "SE": [1, 1],
  }

  const traversePattern = (dir: Dirs, matrix: Matrix, x: number, y: number, matchPattern: string, matchPtr=0): boolean => {
    const [dx, dy] = Direction[dir];
    if (matchPtr == matchPattern.length) {
      return true;
    }
    if (matrix[x] && matrix[x][y]) {
      if (matrix[x][y] === matchPattern[matchPtr]) {
        return traversePattern(dir, matrix, x + dx, y + dy, matchPattern, matchPtr + 1);
      }
    }
    return false;
  }

  const solvePart1 = (inputStr: string, matchPattern: string) => {
    const matrix = inputStr.split("\n").map(row => row.split(""));
    let count = 0;
    matrix.forEach((row, index) => {
      row.forEach((_, cellIndex) => {
        if (matrix[index][cellIndex] != matchPattern[0]) return;
        directions.forEach((dir) => {
          count += traversePattern(dir, matrix, index, cellIndex, matchPattern) ? 1 : 0;
        });
      })
    });
    
    return count;

  }

  const solvePart2 = (inputStr: string, matchPattern = "MAS") => {
    const matrix = inputStr.split("\n").map(row => row.split(""));
    let count = 0;
    matrix.forEach((row, index) => {
      row.forEach((_, cellIndex) => {
        if (matrix[index][cellIndex] != "A") return;
        const firstDiagonal = (traversePattern("NE", matrix, index + Direction["SW"][0], cellIndex  + Direction["SW"][1], matchPattern) ||
          traversePattern("SW", matrix, index + Direction["NE"][0], cellIndex  + Direction["NE"][1], matchPattern) );
        const secondDiagonal = (traversePattern("NW", matrix, index + Direction["SE"][0], cellIndex  + Direction["SE"][1], matchPattern) ||
          traversePattern("SE", matrix, index + Direction["NW"][0], cellIndex  + Direction["NW"][1], matchPattern));
        count += (firstDiagonal &&
          secondDiagonal) ? 1 : 0;
        ;
      })
    });
    
    return count;

  }


  const main = (inputString: string) => {

    console.time();
    console.log("Day 4: Part 1", solvePart1(inputString, "XMAS"));
    console.log("Day 4: Part 2", solvePart2(inputString, "MAS"));
    console.timeEnd();
  };

  readInput();
};

Day1();