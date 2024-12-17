import * as fs from "fs";

const Day16 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input16.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  const SPACE = ".";
  
  type Pos = [number, number];
  const directions = ["^", "<", "v", ">"] as const;

  type Dirs = typeof directions[number];
  const Direction: Record<Dirs, [number, number]> = {
    "v": [1, 0],
    "^": [-1, 0],
    "<": [0, -1],
    ">": [0, 1],
  }

  type WeightedEdge<T> = {node: string, weight: T};
  class Graph<T> {
    map: Map<string, Set<WeightedEdge<T>>>;
    constructor() {
      this.map = new Map<string, Set<WeightedEdge<T>>>();
    }
    addVertex (vertex: string) {
      if (this.map.has(vertex)) return;
      this.map.set(vertex, new Set());
    }
    addEdge (vertex1: string, vertex2: string, weight: T) {
      this.addVertex(vertex1);
      this.addVertex(vertex2);
      this.map.get(vertex1)?.add({node:vertex2, weight});
    }
    printGraph () {
      for (let [vertex, edges] of this.map) {
        console.log(`${vertex} -> ${Array.from(edges).map(x=> `Node:${JSON.stringify(x.node)}, Dir: ${x.weight}`).join(", ")}`);
      }
    }
  }

  const findPositonOfCharIn2DArray = (char: string, matrix: string[][]): Pos => {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === char) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  }

  const move = (pos: Pos, dir: Dirs, layout: string[][], dist: number) => {
    const [dx, dy] = Direction[dir];
    const [nx, ny] = [pos[0]+dx, pos[1]+dy];
    if (layout[nx]?.[ny] === SPACE) {
      return move([nx, ny], dir, layout, dist+1);
    }
    return {pos, dist};
  }

  const findImmediateNeighbors = (layout: string[][], pos: Pos, sourceDir: Dirs) => {
    const sourceDirIndex = directions.indexOf(sourceDir);
    const neighbors: {neighbor: Pos, dir: Dirs}[] = [];
    for (let dir of directions) {
      // if opposite direction continue
      if (Math.abs(directions.indexOf(dir) - sourceDirIndex) === 2)
        continue;
      const [dx, dy] = Direction[dir];
      const [nx, ny] = [pos[0]+dx, pos[1]+dy];
      if (layout[nx]?.[ny] === SPACE) {
        neighbors.push({neighbor: [nx, ny], dir});
      }
    }
    return neighbors;
  }

  const createGraph = (layout: string[][], startPos: Pos) => {
    const graph = new Graph<number>(), visited = new Set<string>();

    const dfs = (p: Pos, sDir: Dirs) => {
      const stack = [{pos:p, sourceDir:sDir}];
      // Use stack to avoid call stack exceeded issues
      while(stack.length > 0) {
        const {pos, sourceDir} = stack.pop() as {pos: Pos, sourceDir: Dirs};
        if (visited.has(pos.toString()+","+sourceDir)) continue;
        visited.add(pos.toString()+","+sourceDir);
        const neighbors = findImmediateNeighbors(layout, pos, sourceDir);
        for (let {neighbor, dir} of neighbors) {
          if (sourceDir !== dir) {
            // Add edge to turn
            graph.addEdge(pos.toString()+","+sourceDir, pos.toString()+","+dir, 1000);
          }
          // Add edge to move
          graph.addEdge(pos.toString()+","+dir, neighbor.toString()+","+dir, 1);
          stack.push({pos: neighbor, sourceDir: dir});
        }
      }

    }
    dfs(startPos, ">");
    return graph;
  }

  const parseInput = (inputStr: string) => {
    const layout = inputStr.split("\n").map((x) => x.split(""));
    const startPos = findPositonOfCharIn2DArray('S', layout);
    const endPos = findPositonOfCharIn2DArray('E', layout);
    return {layout, startPos, endPos};
  }

  const findDijkstraShortestPath = (graph: Graph<number>, start: string, end: string) => {
    const scores: Record<string, number> = {};
    const paths: Record<string, Set<string>> = {};
    const visited: Set<string> = new Set();
    const priorityQ: Set<string> = new Set([start]);
    scores[start] = 0;
    paths[start] = new Set([start]);

    while (priorityQ.size > 0) {
      const minIndex = Array.from(priorityQ).reduce((min, node) => {
        if (scores[node] < min.value) return {value: scores[node], node};
        return min;
      }, {value: Infinity, node: ''});

      priorityQ.delete(minIndex.node);
      if (visited.has(minIndex.node)) { console.log("Not checking for ", minIndex.node);continue};
      visited.add(minIndex.node);
      const neighbors = graph.map.get(minIndex.node) ?? new Set();
      for (let neighbor of neighbors) {
        const newScore = scores[minIndex.node] + neighbor.weight;
        if (!scores[neighbor.node] || newScore < scores[neighbor.node]) {
          scores[neighbor.node] = newScore;
          paths[neighbor.node] = new Set(Array.from(paths[minIndex.node]).map(x => (`${x}||${neighbor.node}`)));
          priorityQ.add(neighbor.node);
        } else if (scores[neighbor.node] && newScore === scores[neighbor.node]) {
          Array.from(paths[minIndex.node]).forEach(x => paths[neighbor.node].add(`${x}||${neighbor.node}`));
        }
      }
     }
    return {score: scores[end], paths: paths[end]};
  }

  const solve1 = (inputStr: string) => {
    // 0. Parse input
    let {layout, startPos, endPos} = parseInput(inputStr);
    console.log("StartPos", startPos, "EndPos", endPos);

    // 1. DFS to get graph
    layout[startPos[0]][startPos[1]] = SPACE;
    layout[endPos[0]][endPos[1]] = SPACE;
    const graph = createGraph(layout, startPos)

    // . Find shortest path
    const {score, paths} = findDijkstraShortestPath(graph, startPos.toString()+",>", endPos.toString()+",^");
    const seats = new Set();
    Array.from(paths)
      .map((x:string) => x.split("||"))
      .flat()
      .forEach(
      (i:string) => {
        const [x,y] = i.split(","); seats.add([x,y].toString())
      }
    );  
    return {score, seats: seats.size};
    
  }

  const main = (inputString: string) => {
    console.time();
    const {score, seats} = solve1(inputString);
    console.log("Day 15: Part 1: ", score, "Part 2: ", seats);
    console.timeEnd();
  };

  readInput();
};

Day16();