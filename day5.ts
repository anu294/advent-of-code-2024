import * as fs from "fs";

const Day5 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input5.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type AdjMatrix = Map<string, string[]>;

  const createMatrix = (order: string) => {
    const n: AdjMatrix = new Map();
    order.split("\n").reduce((acc, line) => {
      const [from, to] = line.split("|").map(str => str.trim());
      if (!acc.has(from)) {
        acc.set(from, []);
      }
      acc.get(from)?.push(to);
      return acc;
    }, n);
    return n;
  }

  const checkIfOrdered = (matrix: AdjMatrix, update: string[]) => {
    let isOrdered = true;
    for (let i = 0; i < update.length - 1; i++) {
      for (let j = i + 1; j < update.length; j++) {
        const found = matrix.get(update[i])?.includes(update[j])
        if (!found) {
          isOrdered = false;
          update.splice(i, 0, update[j]);
          update.splice(j + 1, 1);
        }
      }
    }
    return isOrdered;
  }
    
  const solve = (inputStr: string) => {
    const [order, updates] = inputStr.split("\n\n");

    const matrix = createMatrix(order);
    const updatesList: string[][] = updates.split("\n").map(str => str.split(","));
    let ordered = "", unordered = "";
    console.log(matrix);
    let total1 = 0, total2 = 0;
    updatesList.forEach((update) => {
      const isOrdered = checkIfOrdered(matrix, update);
      if (isOrdered) {
        ordered += update.join(",") + "\n";
        total1 += parseInt(update[(update.length - 1)/2]);
      }
      else {
        unordered += update.join(",") + "\n";
        total2 += parseInt(update[(update.length - 1)/2]);
      }
    });
    return [total1, total2];

  }

  const main = (inputString: string) => {

    console.time();
    console.log("Day 5:", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day5();