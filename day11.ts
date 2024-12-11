import * as fs from "fs";

const Day11 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input11.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  const findNumOfDigits = (num: number) => {
    return num.toString().length;
  }
  const splitNum = (num: number) => {
    const sNum = num.toString(), len = sNum.length;
    const mid = Math.floor(len/2);
    return [parseInt(sNum.slice(0, mid)), parseInt(sNum.slice(mid))];
  }
  const applyRules = (num: number) => {
    if (num === 0) return 1;
    else if(findNumOfDigits(num)%2 === 0) return splitNum(num);
    else return num * 2024;
  }
  const dp = new Map();
  const evalArray = (num: number, times: number) => {
    let count = 0;
    if (dp.has(`${num}-${times}`)) {  
      return dp.get(`${num}-${times}`).count;
    }

    if (times <= 0) return count + 1;
      
    const res = applyRules(num);
    if (res instanceof Array) {
      for (let r of res) {
        count += evalArray(r, times-1);
      }
    } else {
      count+= evalArray(res, times-1);
    }

    dp.set(`${num}-${times}`, {count, times});
    return count;
  }

  const countLengthOfNestedArray = (arr: any[]) => {
    let count = 0, l = arr.length;
    for (let i = 0; i < l; i++) {
      if (arr[i].length > 0) {
        count += countLengthOfNestedArray(arr[i]);
      } else {
        count++;
      }
    }
    return count;
  }


  const solve = (inputStr: string, times: number) => {
    // 0. Parse input
    const nums: any[] = inputStr.split(" ").map(num => parseInt(num));
    console.log(nums);
    // 1. Iterate x times and apply rules to each
    const len = nums.length;
    let count = 0;
    for (let i = 0; i < len; i++) {
      count += evalArray(nums[i], times);
    }

    // 2. Count length of nested array
    return count;
    

  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 11: Part 1: ", solve(inputString, 25));
    console.log("Day 11: Part 2: ", solve(inputString, 75));
    console.timeEnd();
  };

  readInput();
};

Day11();