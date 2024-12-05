import _ from "lodash";
import * as fs from "fs";

const Day1 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input3.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const solve = (inputStr: string) => {
    const pattern = /mul\((\d+),(\d+)\)|do\(\)|don't\(\)/g;
    let matches, shouldDo = true;
    const digits=[];
    while ((matches = pattern.exec(inputStr)) !== null) {
      const [sym, a, b] = matches;
      if (sym=="do()") {
        shouldDo = true;
      } else if (sym=="don't()") {
        shouldDo = false;
      } else {
        digits.push({a: parseInt(a.trim()), b: parseInt(b.trim()), do: shouldDo});
      }

    }
    return digits.reduce((acc, digit) => {
      acc[0] += digit.a * digit.b;
      if (digit.do)
        acc[1] += digit.a * digit.b;
      return acc;
    }, [0, 0]);
  }


  const main = (inputString: string) => {
    console.time();
    console.log("Day 3: Part 1 & 2", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day1();