import * as fs from "fs";

const Day1 = () => {
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

  const findPathWithGraphDfs = (matrix: AdjMatrix, start: string, visited: Set<string>, searchVal: string, path: string[]) => {
    // console.log("start", start, visited, searchVal);
    if (visited.has(start)) return false;
    visited.add(start);
    if (start === searchVal) {
      return true;  
    }
    for (const node of matrix.get(start) ?? []) {
      path.push(node);
      const found = findPathWithGraphDfs(matrix, node, visited, searchVal, path)
      if (found) return true;
      path.pop();

    }

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
    
  const solvePart1 = (inputStr: string) => {
    const [order, updates] = inputStr.split("\n\n");

    const matrix = createMatrix(order);
    const updatesList: string[][] = updates.split("\n").map(str => str.split(","));
    let ordered = "", unordered = "";
    console.log(matrix);
    let total1 = 0, total2 = 0;
    updatesList.forEach((update, index) => {
      const isOrdered = checkIfOrdered(matrix, update);
      if (isOrdered) {
        ordered += update.join(",") + "\n";
        total1 += parseInt(update[(update.length - 1)/2]);
      }
      else {
        unordered += update.join(",") + "\n";
        total2 += parseInt(update[(update.length - 1)/2]);
      }
      // else {
      //   total2 += parseInt(rectifiedUpdateStr[(rectifiedUpdateStr.length - 1)/2]);
      // }
    });

    fs.writeFileSync("output.txt", ordered + "\n\n" + unordered);
    return [total1, total2];

  }

  const solvePart2 = (inputStr: string) => {
    
  }


  const main = (inputString: string) => {

    console.time();
    console.log("Day 5: Part 1", solvePart1(inputString));
    // console.log("Day 5: Part 2", solvePart2(inputString));
    console.timeEnd();
  };

  readInput();
};

Day1();