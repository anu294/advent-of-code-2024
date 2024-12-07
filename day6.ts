import * as fs from "fs";

const Day6 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input6.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  const directions = ["^", ">", "v", "<"] as const;

  type Dirs = typeof directions[number];
  const direction : Record<Dirs, [number, number]> = {
    "^": [-1, 0],
    ">": [0, 1],
    "v": [1, 0],
    "<": [0, -1],
  }

  const inRange = (i: number, j: number, matrix: string[][]) => {
    return (matrix[i] && matrix[i][j]);
  }

  const copyMatrix = (matrix: string[][]) => {
    return matrix.map( r => [...r]);
  }

  const getNextRightDir = (currentDir: Dirs) => {
    const index = directions.indexOf(currentDir);
    return directions[(index + 1) % directions.length];
  }

  const traverse = (matrix: string[][]) => {
    const result = {
      distinctSteps: 1,
      isLoop: false,
    }
    let [x, y, dir] = [matrix.findIndex(r => r.includes("^")), matrix[matrix.findIndex(r=>r.includes("^"))].indexOf("^"), "^" as Dirs];

    const visited = new Set<string>();
    while (inRange(x, y, matrix)) {
      if (matrix[x][y] == ".") {
        matrix[x][y] = dir;
        result.distinctSteps += 1;
      }

      const [dx, dy] = direction[dir];
      let [nx, ny] = [x + dx, y + dy];
      if (matrix[nx]?.[ny] == "#") {
        dir = getNextRightDir(dir);
        if (visited.has(`${x},${y},${dir}`)) {
          result.isLoop = true;
          break;
        }
        visited.add(`${x},${y},${dir}`);
        continue;
      }
      x = nx;
      y = ny;
    }
    return result;
  }

  const findPotentialObstructions = (matrix: string[][], traversedMatrix: string[][]) => {
    console.log(traversedMatrix.map(row => row.join("")).join("\n"));
    const [startX, startY] = [matrix.findIndex(r => r.includes("^")), matrix[matrix.findIndex(r=>r.includes("^"))].indexOf("^")];
    let obstructions = 0
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (traversedMatrix[i][j] !== "." && traversedMatrix[i][j] !== "#" && !(i === startX && j === startY)) {
          const copiedMatrix = copyMatrix(matrix);
          copiedMatrix[i][j] = "#";
          const res = traverse(copiedMatrix);
          if (res.isLoop) {
            console.log("Obstruction", i, j);
            obstructions++;
          }
        }
      }
    }
    return obstructions;
  }

  const solve = (inputStr: string) => {
    const originalMatrix = inputStr.split("\n").map(row => row.split(""));
    
    const traversedMatrix = copyMatrix(originalMatrix);
    const result = traverse(traversedMatrix);
    const result2 = findPotentialObstructions(copyMatrix(originalMatrix), traversedMatrix);
    
    //console.log(traversedMatrix.map(row => row.join("")).join("\n"));
    return [result.distinctSteps, result2];
  }

  const main = (inputString: string) => {

    console.time();
    console.log("Day 5:", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day6();