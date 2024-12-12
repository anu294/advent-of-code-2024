import * as fs from "fs";

const Day12 = () => {
  const readInput = () => {
    let inputString = "";

    const rs = fs.createReadStream("inputs/input12.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
   const directions = ["N", "E", "S", "W"];
   type Dirs = typeof directions[number];

   // Direction order is as per the perimeter calculation for clockwise traversal
   const Direction: Record<Dirs, [number, number]> = {
    "E": [0, 1],
    "S": [1, 0],
    "W": [0, -1],
    "N": [-1, 0],
  }

  type Pos = [number, number];
  type Vector = {pos: Pos, dir: Dirs};

  const findNeighbours = (layout: string[][], pos: Pos) => {
    const [numRows, numCols] = [layout.length, layout[0].length];
    const [x, y] = pos;
    const neighbors: Vector[] = [];
    for (let dir of directions) {
      const [dx, dy] = Direction[dir];
      const [nx, ny] = [x+dx, y+dy];
      if ((nx >= 0 && nx < numRows) && (ny >= 0 && ny < numCols)) {
        neighbors.push({pos:[nx, ny], dir});
      }
    }
    return neighbors;
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
  const createSubGraph = (layout: string[][], pos: Pos, visited: Set<string>, graphMatrix:string[][]) => {
    const type = layout[pos[0]][pos[1]], posKey = pos.toString();
    const graph = new Graph();
    // 1. DFS
    const dfs = (vector: Vector) => {
      const node = vector.pos, nodeKey = node.toString();
      if (visited.has(nodeKey)) return;
      visited.add(nodeKey);
      graph.addVertex(nodeKey);
      graphMatrix[node[0]][node[1]] = posKey;
      const neighbors = findNeighbours(layout, node);
      for (let neighbor of neighbors) {
        const [nx, ny] = neighbor.pos;
        if (layout[nx][ny] === type) {
          const neighborKey = neighbor.pos.toString();
          graph.addEdge(nodeKey, neighborKey, neighbor.dir);
          dfs(neighbor);
        }
      }
    }
    dfs({pos, dir: "E"});
    return graph;
  }
  
  const findSubGraphs = (layout: string[][]) => {
    // create a duplicate of the layout
    const visited = new Set<string>();
    const subGraphs = new Map();
    const graphMatrix = layout.map((row) => [...row]);
    for (let i = 0; i < layout.length; i++) {
      for (let j=0; j < layout[i].length; j++) {
        const start = [i, j], startKey = start.toString();
        if (visited.has(startKey)) continue;
        const graph = createSubGraph(layout, [i, j], visited, graphMatrix);
        subGraphs.set(startKey, graph);
      }
    }
    return {subGraphs, graphMatrix};
  }

  const calcSidesInGraph = (graphMatrix: string[][], start: Pos) => {
    const val = graphMatrix[start[0]][start[1]];
    let sides = 0;
    // 1. traverse all rows
    for (let i = 0; i < graphMatrix.length; i++) {
      for (let j = 0, k=0; j < graphMatrix[i].length || k < graphMatrix[i].length; j++, k++) {
        if (graphMatrix[i]?.[j] === val && graphMatrix[i-1]?.[j] !== val) {
          sides++;
          while(graphMatrix[i]?.[j] === val && graphMatrix[i-1]?.[j] !== val) {
            j++;
          }
        }
        if (graphMatrix[i]?.[k] === val && graphMatrix[i+1]?.[k] !== val) {
          sides++;
          while(graphMatrix[i][k] === val && graphMatrix[i+1]?.[k] !== val) {
            k++;
          }
        }
      }
    }

    // 2. traverse all columns
    for (let i = 0; i < graphMatrix[0].length; i++) {
      for (let j = 0, k = 0; j < graphMatrix.length || k < graphMatrix.length; j++, k++) {
        if (graphMatrix[j]?.[i] === val && graphMatrix[j]?.[i-1] !== val) {
          sides++;
          while(graphMatrix[j]?.[i] === val && graphMatrix[j]?.[i-1] !== val) {
            j++;
          }
        }
        if (k == 1 && i == 1) {
        }
        if (graphMatrix[k]?.[i] === val && graphMatrix[k]?.[i+1] !== val) {
          sides++;
          while(graphMatrix[k]?.[i] === val && graphMatrix[k]?.[i+1] !== val) {
            k++;
          }
        }
      }
    }
    return sides;
  }

  const calcGraphValue = (graphMatrix: string[][], graph: Graph<Dirs>, start: Pos) => {
    let area = 0, perimeter = 0;
    // 1. Area is the numbr of nodes in the graph
    area = graph.map.size;
    // 2. Perimeter is the 4 - (number of edges per node)
    for (let [_, edges] of graph.map) {
      perimeter += 4 - edges.size;
    }
    // 3. Number of sides
    const sides = calcSidesInGraph(graphMatrix, start);
    // 4. Return the value = area * perimeter
    return [area * perimeter, area * sides];
  }

  const solve = (inputStr: string) => {
    // parseInput
    const layout = inputStr.split("\n").map((row) => row.split(""));
    // Find all sub graphs
    const {subGraphs, graphMatrix} = findSubGraphs(layout);
    // Get the value for each subgraph
    let totalValue = [0, 0];
    subGraphs.forEach((graph, startStr) => {
      const start = startStr.split(",").map((x: string) => parseInt(x)) as Pos;
      const res =  calcGraphValue(graphMatrix, graph, start);
      totalValue[0] += res[0];
      totalValue[1] += res[1];
    });
    return totalValue;

    

  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 12: Part 1: ", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day12();