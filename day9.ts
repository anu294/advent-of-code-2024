import * as fs from "fs";

const Day9 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input9.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const getCheckSum = (arr: (string | number)[]) => {
    return arr.reduce((acc: number, char, i) => {
      if (typeof char === "string") return acc;
      const num = parseInt(char.toString()) as number;
      if (isNaN(num)) return acc;
      return acc + (num * i);
    }, 0);
  }

  const getDecodedString = (inputStr: string) => {
    const len = inputStr.length;
    let decompressedData = [];
    for (let i = 0, fileNum = 0; i < len; i=i+2, fileNum++) {
      const numOfBlocks = parseInt(inputStr[i]);
      const numOfSpaces = parseInt(inputStr[i+1]);
      for (let j = 0; j < numOfBlocks; j++) {
        decompressedData.push(fileNum);
      }
      for (let j = 0; j < numOfSpaces; j++) {
        decompressedData.push(".");
      }
    }
    return decompressedData;
  }


  const getCompressedDataLayout = (decodedArray: (string | number)[]) => {
    let left =0, right = decodedArray.length - 1;
    while (left <= right) {

      while (decodedArray[left] !== ".") {
        left++;
      }
      while (decodedArray[right] === ".") {
        right--;
      }
      if (left > right) break;

      [decodedArray[left], decodedArray[right]] = [decodedArray[right], decodedArray[left]];

    }
    return decodedArray;
  }

  const findIndexOfFirstFreeSpace = (decodedArray: (string | number)[], times: number) => {
    for (let i = 0; i < decodedArray.length; i++) {
      if (decodedArray[i] === ".") {
        let j = i;
        while (decodedArray[j] === ".") {
          j++;
        }
        if (j - i >= times) {
          return i;
        }
        i = j - 1;
      }
    }
    return -1;
  }

  const getCompressedDataLayoutWithoutFragmentation = (decodedArr: (string | number)[]) => {
    const len = decodedArr.length;
    const arr = [...decodedArr];
    for (let i = len - 1; i >= 0; i--) {
      if (arr[i] === ".") {
        continue;
      }
      let curr = i;
      while (arr[curr] === arr[curr-1]) {
        curr--;
      }
      const times = i - curr + 1;
      const freeSpacePos = findIndexOfFirstFreeSpace(arr, times);
      if (freeSpacePos !== -1 && freeSpacePos < i) {
        for (let j = 0; j < times; j++) {
          arr[freeSpacePos + j] = arr[curr];
          arr[i - j] = ".";
        }
      }
      i = i - times + 1;
    }
    return arr;
  }

  const solve1 = (inputStr: string) => {
    const decodedArray = getDecodedString(inputStr);
    const compressedDataLayout = getCompressedDataLayout(decodedArray);
    console.log(compressedDataLayout);
    return getCheckSum(compressedDataLayout);
  }
  const solve2 = (inputStr: string) => {
    const decodedArray = getDecodedString(inputStr);
    const compressedDataLayout = getCompressedDataLayoutWithoutFragmentation(decodedArray);
    console.log(compressedDataLayout.join(""));
    return getCheckSum(compressedDataLayout);
  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 9: Part 1: ", solve1(inputString));
    console.log("Day 9: Part 2: ", solve2(inputString));
    console.timeEnd();
  };

  readInput();
};

Day9();