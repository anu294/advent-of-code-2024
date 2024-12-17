import * as fs from "fs";

const Day14 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input14.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  // const WIDTH = 11;
  // const HEIGHT = 7;
  const WIDTH = 101;
  const HEIGHT = 103;


  interface Robot {
    start: Pos;
    velocity: Pos;
  }
  
  type Pos = [number, number];

  const parseInputOfRobots = (inputStr: string): Robot[] => {
    const robots: Robot[] = inputStr.split("\n").map(x => {
      const posStr = x.split(" ")[0].split("p=")[1];
      const velocityStr = x.split(" ")[1].split("v=")[1];
      const robot = { 
        start: posStr.split(",").map(x => parseInt(x)) as Pos,
        velocity: velocityStr.split(",").map(x => parseInt(x)) as Pos
      }
      return robot;
    });
    return robots;
  }

  const findPath = (robot: Robot, time: number) => {
    const positions: Pos[] = [];
    let [x, y] = robot.start;
    const [dx, dy] = robot.velocity;
    for (let i = 0; i < (time+1); i++) {
      positions.push([x, y]);
      x = (x + dx) % WIDTH;
      y = (y + dy) % HEIGHT;
      if (x < 0) x += WIDTH;
      if (y < 0) y += HEIGHT;
      if (x === robot.start[0] && y === robot.start[1]) {
        // console.log(`Robot ${robot.start}: ${i}`);
        break;
      }
    }
    return positions;
  }

  const getQuadrant = (pos: Pos) => {
    const [x, y] = pos;
    //console.log("WIDTH HEIGHT", (WIDTH - 1)/2, (HEIGHT - 1)/2);
    if (x < (WIDTH - 1)/2 && y < (HEIGHT - 1)/2) {
      return 0;
    } else if (x > (WIDTH - 1)/2 && y < (HEIGHT - 1)/2) {
      return 1;
    } else if (x > (WIDTH - 1)/2 && y > (HEIGHT - 1)/2) {
      return 2;
    } else if (x < (WIDTH - 1)/2 && y > (HEIGHT - 1)/2) {
      return 3;
    }
    return -1;
  }

  const botPaths: Pos[][]=[];

  const solve = (inputStr: string, time: number) => {
    //0. Setup visuals
    const arr = new Array(HEIGHT).fill(0).map(() => new Array(WIDTH).fill("."));
    // 1. parseInput
    const robots = parseInputOfRobots(inputStr);

    // 2. Find bot paths
    robots.forEach((robot) => {
      const path = findPath(robot, time);
      botPaths.push(path);
    })
    
    // 2. Find position after time seconds lapsed
    const quadrantBucket = [0,0,0,0];
    robots.forEach((robot, index) => {
      // 2.a Find path bot travels
      const path = botPaths[index];
      const repeatLen = path.length;
      // 2.b Find the position at the time
      const pos = path[((time) % repeatLen)];
      // 2.c Find the quadrant
      const quadrant = getQuadrant(pos);
      if (quadrant === -1) {
        // console.log(`Invalid Quadrant: ${pos}`);
        return;
      }
      arr[pos[1]][pos[0]] = "#";
      //console.log(`Quadrant ${pos}: ${quadrant}`);
      quadrantBucket[quadrant]++;
      //console.log(`Final ${pos}: ${JSON.stringify(path)}`);
    });
    // console.log("Quadrant Bucket: ", quadrantBucket);
    // 3. Multiply value of all quadrants
    // console.log("\n\n\n");
    ;
    return [quadrantBucket.reduce((acc, val) => acc * val, 1), arr.map(x => x.join("")).join("\n")];

    

  }


  const main = (inputString: string) => {
    console.time();
    // console.log("Day 14: Part 1: ", solve(inputString, 100)[0]);
    
    let final = "\n\n\n";
    for(let i = 1500; i < 3000; i++) {
      final +="xxxxxxxxxx"+"\n"+i + "\n"+ solve(inputString, i) +"\n\n\n\n";
    }
    //console.log("Day 14: Part 2: ", solve(inputString));
    fs.writeFileSync("output14-1.txt", final);
    console.timeEnd();
  };

  readInput();
};

Day14();