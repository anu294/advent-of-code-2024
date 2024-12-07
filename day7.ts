import * as fs from "fs";

const Day7 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input7.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const OPERATORS = ["+", "*", "||"];
  const BASE = OPERATORS.length;
  const readEquations = (inputStr: string) => {
    return inputStr.split("\n").map(str => {
      const [valueStr, operandsStr] = str.split(":");
      const value = parseInt(valueStr.trim());
      const operands = operandsStr.trim().split(" ").map(str => parseInt(str.trim()));
      return {value, operands};
    });
  }

  const evaluate = (operands:[number, number], op: string) => {
    switch(op) {
      case "+":
        return operands[0] + operands[1];
      case "*":
        return operands[0] * operands[1];
        case "||":
        return parseInt(`${operands[0]}${operands[1]}`);
      default:
        console.error("Invalid operand");
        return 0;
    }
  }

  const updateTreeNodeLeaves = (tree: number[], num: number, nodeIndex: number) => {
    let currTot = 0;
    const leafNode = tree[nodeIndex];
    OPERATORS.forEach(op => {
      currTot = evaluate([leafNode, num], op);
      tree.push(currTot);
    });
  }

  const updateAllTreeNodeLeaves = (tree: number[], num: number, treeLevel: number) => {
    const treeLength = tree.length;
    const countNonLeafNodes = tree.length - Math.floor(Math.pow(BASE, treeLevel));
    for (let leafIndex = countNonLeafNodes; leafIndex < treeLength; leafIndex++) {
      updateTreeNodeLeaves(tree, num, leafIndex);
    }
  }

  const solve = (inputStr: string) => {
    const equations = readEquations(inputStr);
    
    const sum = equations.reduce((acc, equation) => {
      const {value, operands} = equation, tree = [];
      let treeLevel = 0, currTot = 0, found = false;

      // 1. if only 1 operand, direct check
      if (operands.length == 1) {
        return operands[0] == value ? acc + value : acc;
      }

      // 2. Create root node for tree
      tree.push(operands[0]);

      // 3. Iterate leaf nodes
      for (let i = 1; i < operands.length; i++) {
        updateAllTreeNodeLeaves(tree, operands[i], treeLevel);
        treeLevel++;
      }

      // 4. Check if value is found in last level of tree
      found = tree.slice(tree.length - Math.pow(BASE, treeLevel)).some(node => node == value);
      if (found) {
        acc += value;
      }

      return acc;
    }, 0);
    return sum;
  }
  const main = (inputString: string) => {

    console.time();
    console.log("Day 7:", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day7();