import _ from "lodash";
import * as fs from "fs";

const Day1 = () => {

  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input2.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  const splitStringsToArray = (reportsString: string) => {
    const reportStrings = reportsString.split("\n");
    const reportsList: number[][] = [];
    reportStrings.reduce((acc, reportStr) => {
      acc.push(reportStr.split(" ").map(str => parseInt(str)));
      return acc;
    }, reportsList);
    return reportsList;
  }

  const MAX_DIFF = 3;
  const MIN_DIFF = 1;

  const getGradualChangeDirection = (report: number[], i: number, j: number) => {
    const diff = report[j] - report[i];
    const startRange = MIN_DIFF, endRange = MAX_DIFF;
    if (diff >= startRange && diff <= endRange) return 1
    else if (diff <= -startRange && diff >= -endRange) return -1
    return 0;
  }

  const getSafeReportsCount = (reportList: number[][], maxStrike: number) => {
    let countOfSafeReports = 0;
    let safeStr = "";

    const isDiffInRange = (diff: number, min: number, max: number) => diff >= min && diff <= max;
    reportList.forEach((report) => {
      if (report.length < 2) {
        countOfSafeReports++;
        return;
      }

      let isIncreasing = isDiffInRange(report[1] - report[0], MIN_DIFF, MAX_DIFF);
      let isSafe = true, strikes = 0, start = 0;
      // if (getGradualChangeDirection(report, 0, 2) && getGradualChangeDirection(report, 0, 2) == getGradualChangeDirection(report, 2, 3)) {
      //   isIncreasing = getGradualChangeDirection(report, 0, 2) == 1 ? true : false;
      //   start = 2;
      //   strikes++;
      // } else if (getGradualChangeDirection(report, 1, 2)) {
      //   isIncreasing = getGradualChangeDirection(report, 1, 2) == 1 ? true : false;
      //   strikes++;
      // }
      for (let i = start; i < report.length - 1; i++) {
        const diff = report[i + 1] - report[i];
        if ((isIncreasing && !isDiffInRange(diff, MIN_DIFF, MAX_DIFF)) 
          || (!isIncreasing && !isDiffInRange(-diff, MIN_DIFF, MAX_DIFF))) {

          if (strikes >= maxStrike) {
            isSafe = false;
            break;
          }
          if (i == report.length - 2) {
            strikes++;
            continue;
          }
          // check if the next diff is increasing
          const diffExcldNext = report[i + 2] - report[i];
          if ((isIncreasing && isDiffInRange(diffExcldNext, MIN_DIFF, MAX_DIFF))
            || (!isIncreasing && isDiffInRange(-diffExcldNext, MIN_DIFF, MAX_DIFF))) {
            strikes++;
            i++;
            continue;
          }

          // check if we can change the direction
          if (i == 0) {
            // there are cases where the initial diff was increasing but the next diff is decreasing
            // so we need to check if the next diff is decreasing
            console.log("got here")
            if (getGradualChangeDirection(report, 0, 2) && getGradualChangeDirection(report, 0, 2) == getGradualChangeDirection(report, 2, 3)) {
              isIncreasing = getGradualChangeDirection(report, 0, 2) == 1 ? true : false;
              i++;
              strikes++;
              continue;
            } else if (getGradualChangeDirection(report, 1, 2)) {
              isIncreasing = getGradualChangeDirection(report, 1, 2) == 1 ? true : false;
              strikes++;
              continue;
            }
          }

          isSafe = false;
          break;
        }
      }
      if (isSafe) {
        safeStr += report.join(" ") + "\n";
        countOfSafeReports++;
      }
    })
    fs.writeFileSync("safeReports.txt", safeStr);
    return countOfSafeReports;
  }

  const solvePart1 = (reports: number[][]) => {
    return getSafeReportsCount(reports, 0);
  }

  const solvePart2 = (reports: number[][]) => {
    return getSafeReportsCount(reports, 1);
  }

  const main = (reportsString: string) => {
    console.time();
    const reportsList = splitStringsToArray(reportsString);
    console.log("Day 2: Part 1", solvePart1(reportsList));
    console.log("Day 2: Part 2", solvePart2(reportsList));
    console.timeEnd();
  };

  readInput();
};

Day1();