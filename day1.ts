import _ from "lodash";
import * as fs from "fs";

const Day1 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input1.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  const splitStringsToArray = (inputString: string) => {
    const lines = inputString.split("\n");
    const numOfNotes = 2;
    // inert array []in locations Matrix as many as num of notes
    const locationsMatrix :number[][] = Array.from({length:numOfNotes}, () => new Array());
    lines.reduce((acc, line) => {
      const locations = line.replace(/\s+/g, " ").split(" ");
      locations.forEach((location, index) => {
        acc[index].push(parseInt(location.trim()));
      })
      return acc;
    }, locationsMatrix);
    return locationsMatrix;
  }

  const solvePart1 = (locationsMatrix: number[][]) => {
    const [locations1, locations2] = locationsMatrix;
    locations1.sort((a, b) => a - b);
    locations2.sort((a, b) => a - b);
    const sumOfDiff = locations2.reduce((acc, location, index) => {
      const diff = location - locations1[index];
      acc += Math.abs(diff)
      return acc;
    }, 0);
    return sumOfDiff;
  }

  const solvePart2 = ([locations1, locations2] : number[][]) => {
    const occurraceMap = new Map<number, number>();
    locations2.reduce((acc, location) => {
      acc.set(location, (acc.get(location) ?? 0) + 1);
      return acc;
    }, occurraceMap)
    const sum = locations1.reduce((acc, location) => {
      acc += (occurraceMap.get(location) ?? 0) * location;
      return acc;
    }, 0)
    return sum;
  }

  const main = (inputString: string) => {
    console.time();
    const locationsArr = splitStringsToArray(inputString);
    console.log("Day 1: Part 1", solvePart1(locationsArr));
    console.log("Day 1: Part 2", solvePart2(locationsArr));
    console.timeEnd();
  };

  readInput();
};

Day1();