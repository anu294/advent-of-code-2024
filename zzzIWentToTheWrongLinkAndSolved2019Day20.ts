import * as fs from "fs";
import { reverse } from "lodash";

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

  const isLetter = (c: string) => {
    return c.match(/[a-z]/i)
  }

  const getComplementNodeId = (node: string) => {
    if (node[node.length-1] === "'") return node.slice(0, -1);
    return `${node}'`;
  }

  type Pos = [number, number];
  type WeightedNode = {weight: number, node: string};

  const getNeighbours = (layout: string[][], pos: [number, number]) => {
    const [i, j] = pos;
    const neighbours: [number, number][] = [];
    if (i > 0) neighbours.push([i-1, j]);
    if (i < layout.length - 1) neighbours.push([i+1, j]);
    if (j > 0) neighbours.push([i, j-1]);
    if (j < layout[0].length - 1) neighbours.push([i, j+1]);
    return neighbours;
  }

  const bfsToGetEdges = (layout: string[][], pos: Pos, adjMatrix: Map<string, Set<WeightedNode>>, nodesPosMap: Record<string, Pos>, reverseMap: Record<string, string>) => {
    const visited = new Set<string>();
    const allNextNodes: Pos[] = [pos];
    const bfs = () => {
      while (allNextNodes.length > 0) {
        const pos = allNextNodes.shift() as Pos, [x, y] = pos, currNode = reverseMap[`${x}-${y}`];
        if (visited.has(`${x}-${y}`)) continue;
        visited.add(`${x}-${y}`);

        const nextNodes = findNextNodes(layout, pos, reverseMap, nodesPosMap);
        nextNodes.forEach(n => {
          adjMatrix.get(currNode)?.add(n);

        });
        nextNodes.map(n => nodesPosMap[n.node]).forEach(n => allNextNodes.push(n));
      }

    }
    bfs();
  }

  const findNextNodes = (layout: string[][], pos: Pos, reverseMap: Record<string,string>, nodesPosMap: Record<string, Pos>) => {
    const visited = new Set<string>([`${pos[0]}-${pos[1]}`]);
    // console.log("start", pos,layout.map(r=>r.join("")).join("\n"), reverseMap);
    const nextNodes: WeightedNode[] = [];
    const dfs = (cPos: Pos, cDist: number) => {
      const [i, j] = cPos;
      

      const neighbours = getNeighbours(layout, cPos);

      for (let neighbour of neighbours) {
        const [ni, nj] = neighbour;
        if (visited.has(`${ni}-${nj}`)) continue;

        const neighborNodeId = reverseMap[`${ni}-${nj}`];

        if (layout[ni][nj] === ".") {
          visited.add(`${ni}-${nj}`);
          dfs(neighbour, cDist+1);
          visited.delete(`${ni}-${nj}`);
        }
        if (neighborNodeId) {
          const complementNodeId = getComplementNodeId(neighborNodeId)
          if (nodesPosMap[complementNodeId]) nextNodes.push({weight: (cDist+2), node: complementNodeId});
          else nextNodes.push({weight: (cDist+1), node: neighborNodeId});
        }
      }
    }
    dfs(pos, 0);
    return nextNodes;
  }
    

  const parseInput = (inputStr: string) => {
    // Padding of 2 around the input
    const layout = inputStr.split("\n").map(str => str.split(""));
    const len = layout.length, width = layout[0].length;
    const nodesPosMap: Record<string, Pos> = {};
    const reverseMap: Record<string, string> = {};
    // 1. Find all Outer nodes
    // 1a. top & bottom row
    for (let i = 0; i < width; i++) {
      if (isLetter(layout[0][i])) {
        nodesPosMap[`${layout[0][i]}${layout[1][i]}`] = [2, i];
        reverseMap[`2-${i}`] = `${layout[0][i]}${layout[1][i]}`;
      }
      if (isLetter(layout[len-2][i])) {
        nodesPosMap[`${layout[len-2][i]}${layout[len-1][i]}`] = [len-3, i];
        reverseMap[`${len-3}-${i}`] = `${layout[len-2][i]}${layout[len-1][i]}`;
      }
    }
    // 1b. left & right column
    for (let i = 0; i < len; i++) {
      if (isLetter(layout[i][0])) {
        nodesPosMap[`${layout[i][0]}${layout[i][1]}`] = [i, 2];
        reverseMap[`${i}-2`] = `${layout[i][0]}${layout[i][1]}`;
      }
      if (isLetter(layout[i][width-2])) {
        nodesPosMap[`${layout[i][width-2]}${layout[i][width-1]}`] = [i, width-3];
        reverseMap[`${i}-${width-3}`] = `${layout[i][width-2]}${layout[i][width-1]}`;
      }
    }

    // 2. Find all Inner nodes
    for (let i = 2; i < len-2; i++) {
      for (let j = 2; j < width-2; j++) {
        if (isLetter(layout[i][j])) {
          // 2a. Vertical Inner nodes top
          if (isLetter(layout[i+1][j]) && layout[i-1][j] === ".") {
            nodesPosMap[`${layout[i][j]}${layout[i+1][j]}'`] =[i-1, j];
            reverseMap[`${i-1}-${j}`] = `${layout[i][j]}${layout[i+1][j]}'`;
          }
          // 2b. Vertical Inner nodes bottom
          if (isLetter(layout[i+1][j]) && layout[i+2][j] === ".") {
            nodesPosMap[`${layout[i][j]}${layout[i+1][j]}'`] = [i+2, j];
            reverseMap[`${i+2}-${j}`] = `${layout[i][j]}${layout[i+1][j]}'`;
          }
          // 2c. Horizontal Inner nodes left
          if (isLetter(layout[i][j+1]) && layout[i][j-1] === ".") {
            nodesPosMap[`${layout[i][j]}${layout[i][j+1]}'`] = [i, j-1];
            reverseMap[`${i}-${j-1}`] = `${layout[i][j]}${layout[i][j+1]}'`;
          }
          // 2d. Horizontal Inner nodes right
          if (isLetter(layout[i][j+1]) && layout[i][j+2] === ".") {
            nodesPosMap[`${layout[i][j]}${layout[i][j+1]}'`] = [i, j+2];
            reverseMap[`${i}-${j+2}`] = `${layout[i][j]}${layout[i][j+1]}'`;
          }
        }
      }
    }

    //3. Create graph
    const adjMatrix = new Map<string, Set<WeightedNode>>();
    // 3a. Add all nodes
    for (let node in nodesPosMap) {
      adjMatrix.set(node, new Set<WeightedNode>());
    }
    // 3b. Add all edges from AA
    const nodeAA = nodesPosMap["AA"];
    bfsToGetEdges(layout, nodeAA, adjMatrix, nodesPosMap, reverseMap);
    
      

    //console.log("adjMatrix",adjMatrix)

    return {nodesPosMap, layout, adjMatrix};
  }

  const dijkstra = (start: string, end: string, adjMatrix: Map<string, Set<WeightedNode>>) => {
    const dist: Record<string, number> = {};
    const visited = new Set<string>();
    const pq = new Set<string>();
    pq.add(start);
    dist[start] = 0;
    while (pq.size > 0) {
      let minNode = "";
      let minDist = Infinity;
      for (let node of pq) {
        if (dist[node] < minDist) {
          minDist = dist[node];
          minNode = node;
        }
      }
      //console.log("dist", dist, "minNode", minNode, "pq", pq);
      pq.delete(minNode);
      visited.add(minNode);
      const neighbours = adjMatrix.get(minNode) as Set<WeightedNode>;
      for (let neighbour of neighbours) {
        if (visited.has(neighbour.node)) continue;
        const newDist = dist[minNode] + neighbour.weight;
        if (!dist[neighbour.node] || newDist < dist[neighbour.node]) {
          dist[neighbour.node] = newDist;
          pq.add(neighbour.node);
        }
      }
    }
    return dist[end];
  }

  const solve = (inputStr: string) => {
    // 1. Parse input as a graph
    const {adjMatrix} = parseInput(inputStr);
    // 2. Find the shortest path from AA to ZZ using Dijkstra's algorithm
    const shortestPath = dijkstra("AA", "ZZ", adjMatrix);
    return shortestPath;


  }
  const main = (inputString: string) => {
    console.time();
    console.log("Day 11: Part 1: ", solve(inputString));
    console.timeEnd();
  };

  readInput();
};

Day11();