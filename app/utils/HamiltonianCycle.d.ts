type Graph = (0 | 1)[][];

export default class HamiltonianCycle {
  constructor(graph: Graph);
  graph: Graph;
  count(): number;
  isSafe(v: any, path: any, pos: any): boolean;
  isCycle(path: any, pos: any): boolean;
  run(): number[];
}
