import * as fs from "fs";

const Day13 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input13.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  interface Machine {
    prizePos: Pos;
    btnADir: Pos;
    btnBDir: Pos;
  }

  type Pos = [number, number];

  const parseInputOfMachnes = (inputStr: string, unit: number): Machine[] => {
    const machineStrings = inputStr.split("\n\n");
    const machines: Machine[] = [];
    machineStrings.forEach((machineStr) => {
      const lines = machineStr.split("\n");
      const machine: Machine = {
        "btnADir" : lines[0].split(":")[1].split(",").map(x => parseInt(x.trim().split("+")[1])) as Pos,
        "btnBDir" : lines[1].split(":")[1].split(",").map(x => parseInt(x.trim().split("+")[1])) as Pos,
        "prizePos": lines[2].split(":")[1].split(",").map(x => parseInt(x.trim().split("=")[1])+unit) as Pos
      }
      machines.push(machine);
    });
    return machines;
  }

  const solveSimultaneousEquation = (pos1: Pos, pos2: Pos, total1: number, total2: number) => {
    const [a1, a2] = pos1;
    const [b1, b2] = pos2;
    const [c1, c2] = [total1, total2];
    const x = (c1*b2 - c2*b1)/(a1*b2 - a2*b1);
    const y = (a1*c2 - a2*c1)/(a1*b2 - a2*b1);
    return [x, y];
  }
  const solve = (inputStr: string, unit: number) => {
    // parseInput
    const machines = parseInputOfMachnes(inputStr, unit);
    
    // solve simultaneous equatioms for each machine
    let total = 0;
    machines.forEach((machine) => {
      const [x, y] = solveSimultaneousEquation(machine.btnADir, machine.btnBDir, machine.prizePos[0], machine.prizePos[1]);
      // check if whole numbers
      if (x >= 0 && y >= 0 && Number.isInteger(x) && Number.isInteger(y)) {
        total += ((3*x) + y);
      }
      //console.log(`Machine: ${JSON.stringify(machine)}: x: ${x}, y: ${y}`);
    });
    return total;

    

  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 13: Part 1: ", solve(inputString, 0));
    console.log("Day 13: Part 2: ", solve(inputString, 10000000000000));
    console.timeEnd();
  };

  readInput();
};

Day13();