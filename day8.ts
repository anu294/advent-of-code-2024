import * as fs from "fs";
import { inRange } from "lodash";

const Day8 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input8.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const inRange = (i: number, j: number, matrix: string[][]) => {
    return (matrix[i] && matrix[i][j]);
  }

  const findAntinodePositions = (position1: [number, number], position2: [number, number], matrix: string[][], withResonance: boolean) => {
    const antinodePositions = [];
    const [x1, y1] = position1;
    const [x2, y2] = position2;
    const [dx, dy] = [x2 - x1, y2 - y1];
    let [anx1, any1] = [x1 - dx, y1 - dy];
    let [anx2, any2] = [x2 + dx, y2 + dy];
    while (inRange(anx1, any1, matrix)) {
      antinodePositions.push([anx1, any1]);
      if (!withResonance) break;
      [anx1, any1] = [anx1 - dx, any1 - dy];
    }
    while (inRange(anx2, any2, matrix)) {
      antinodePositions.push([anx2, any2]);
      if (!withResonance) break;
      [anx2, any2] = [anx2 + dx, any2 + dy];
    }
    return antinodePositions;
  }

  const solve = (inputStr: string, withResonance: boolean) => {
    const antennaMatrix = inputStr.split("\n").map(r => r.split(""));

    // 1. Find all unique antenna frequencies and their positions
    const freqsMap = new Map<string, [number, number][]>();
    antennaMatrix.forEach((r, i) => {
      r.forEach((c, j) => {
        if (c === ".") return;
        if (!freqsMap.has(c))
          freqsMap.set(c, [[i,j]]);
        else 
          freqsMap.get(c)?.push([i,j]);
      })
    })

    // 2. For all permutations of positions of each frequency, find their antinode position
    const antinodePositionsSet = new Set<string>();
    const freqs = Array.from(freqsMap.keys());
    freqs.forEach((freq) => {
      const freqsPositions = freqsMap.get(freq) as [number, number][];
      const numOfFreqs = freqsPositions?.length ?? 0;
      if (numOfFreqs < 2) return;
      for (let i = 0; i < numOfFreqs; i++) {
        for (let j = i + 1; j < numOfFreqs; j++) {
          const [pos1, pos2] = [freqsPositions[i], freqsPositions[j]];
          const antinodePositions = findAntinodePositions(pos1, pos2, antennaMatrix, withResonance);
          antinodePositions.forEach(p => antinodePositionsSet.add(p.toString()));
        }
        if (withResonance) antinodePositionsSet.add(freqsPositions[i].toString());
      }
    });
    return antinodePositionsSet.size;
  }
  const main = (inputString: string) => {

    console.time();
    console.log("Day 8: Part 1: ", solve(inputString, false));
    console.log("Day 8: Part 2: ", solve(inputString, true));
    console.timeEnd();
  };

  readInput();
};

Day8();