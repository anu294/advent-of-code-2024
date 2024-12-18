import * as fs from "fs";

const Day18 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input18.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  //const LEN = 7;
  const LEN = 71;
  const BYTE = "#";

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  type Pos = [number, number];
  class Graph {
    adjMatrix: Map<string, string[]>;
    constructor() {
      this.adjMatrix = new Map();
    }
    addVertex (vertex:string) {
      if (!this.adjMatrix.has(vertex)) {
        this.adjMatrix.set(vertex, []);
      }
    }
    addEdge(from: string, to: string) {
      if (!this.adjMatrix.has(from)) {
        this.adjMatrix.set(from, []);
      }
      this.adjMatrix.get(from)?.push(to);
    }
    printGraph() {
      for (const [key, value] of this.adjMatrix) {
        console.log(key, value);
      }
    }
  }
  const parseInput = (inputStr: string, slice: number) => {
    const layout: string[][] = Array.from({length: LEN}, e => Array(LEN).fill("."));

    const corruptedPosArr:Pos[] = inputStr.split("\n").map((line) => {
      const [x, y] = line.split(",");
      return [parseInt(y), parseInt(x)]
    });
    for (let i = 0; i < slice; i++) {
      const[cy, cx] = corruptedPosArr[i];
      layout[cy][cx] = BYTE;
    }
    // Get graph
    const graph = new Graph();
    const visited: Set<string> = new Set();
    const dfs = (pos: Pos) => {
      if (visited.has(pos.toString())) return;
      visited.add(pos.toString());
      const neighbors = findNeighbors(pos);
      for (const neighbor of neighbors) {
        if (layout[neighbor[0]][neighbor[1]] === BYTE) continue;
        graph.addEdge(pos.toString(), neighbor.toString());
        dfs(neighbor);
        
      }
    }
    dfs([0, 0]);
    //console.log(graph.printGraph());
    return {graph, corruptedPosArr};
  }
  const findNeighbors = (pos: Pos) => {
    const neighbors: Pos[] = [];
    for (const dir of directions) {
      const [dy, dx] = dir;
      const [y, x] = pos;
      const [ny, nx] = [y+dy, x+dx];
      if (nx >= 0 && nx < LEN && ny >= 0 && ny < LEN) {
        neighbors.push([ny, nx]);
      }
    }
    return neighbors;
  }

  const findNodeWithLeastDistance = (dist: Map<string, number>, priorityQ: Set<string>) => {
    return Array.from(priorityQ).reduce((min: {node: string, dist: number}, node) => {
      const nodeDist = dist.get(node) as number;
      if (nodeDist < min.dist) {
        min = {node, dist: nodeDist};
      }
      return min;
    }, {node: '', dist: Infinity});
  }

  const dijkstras = (graph: Graph, start: string, end: string) => {
    const priorityQ = new Set<string>();
    const dist = new Map<string, number>();
    const visited = new Set<string>();
    priorityQ.add(start);
    dist.set(start, 0);
    while(priorityQ.size > 0) {
      const {node: minNode} = findNodeWithLeastDistance(dist, priorityQ);
      priorityQ.delete(minNode);
      visited.add(minNode);
      const neighbors = graph.adjMatrix.get(minNode) ?? [];
      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue;
        const neighborDist = dist.get(minNode) as number + 1;
        if (neighborDist < (dist.get(neighbor) ?? Infinity)) {
          dist.set(neighbor, neighborDist);
          priorityQ.add(neighbor);
        }
      }
    }
    return dist.get(end);
  };

  const solve1 = (inputStr: string) => {
    //0. Parse input
    const bytes = 1024;//12;
    const {graph} = parseInput(inputStr, bytes);
    //1, Find shortes path using dijkstras
    return dijkstras(graph, [0,0].toString(), [LEN-1,LEN-1].toString());

  }

  const solve2 = (inputStr: string) => {
    //0. Parse input
    const bytes = 1024;//12;
    const {corruptedPosArr} = parseInput(inputStr, bytes);
    //1. Binary search a corruptedPosArr ptr which when we check for path to end we get undefined
    let start = bytes, end = corruptedPosArr.length;
    while(start < end) {
      const mid = Math.floor((start + end)/2);
      const {graph} = parseInput(inputStr, mid);
      const pathLen = dijkstras(graph, [0,0].toString(), [LEN-1,LEN-1].toString());
      if (pathLen !== undefined) {
        start = mid+1;
      } else {
        end = mid-1;
      }
    }
    
    const [fy, fx] = corruptedPosArr[start];
    return [fx, fy].join();


  }


  const main = (inputString: string) => {
    console.log("Day 15: Part 1: ", solve1(inputString));
    console.time();
    console.log("Day 15: Part 2: ", solve2(inputString));
    console.timeEnd();
  };

  readInput();
};

Day18();