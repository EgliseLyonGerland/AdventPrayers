type Graph = (0 | 1)[][];

export default class HamiltonianCycle {
  constructor(graph: Graph);
  graph: Graph;
  count(): number;
  isSafe(v: unknown, path: unknown, pos: unknown): boolean;
  isCycle(path: unknown, pos: unknown): boolean;
  run(): number[];
}
