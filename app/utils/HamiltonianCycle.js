export default class HamiltonianCycle {
  constructor(graph) {
    this.graph = graph;
    this.path = [];
  }

  count() {
    const size = this.graph.length;

    // Initialize a dp array
    let dp = new Array(size).fill(0).map(() => new Array(1 << size).fill(0));

    // Initialize for the first vertex
    dp[0][1] = 1;

    // Iterate over all the masks
    for (let i = 2; i < 1 << size; i++) {
      // If the first vertex is absent
      if ((i & (1 << 0)) == 0) continue;

      // Only consider the full subsets
      if (i & (1 << (size - 1)) && i != (1 << size) - 1) continue;

      // Choose the end vertex
      for (let end = 0; end < size; end++) {
        // If this vertex is not in the subset
        if (i & (1 << end == 0)) continue;

        // Set without the end vertex
        let prev = i - (1 << end);

        // Check for the adjacent veticies
        for (let it of this.graph[end]) {
          if (i & (1 << it)) {
            dp[end][i] += dp[it][prev];
          }
        }
      }
    }

    return dp[size - 1][(1 << size) - 1];
  }

  isSafe(v, path, pos) {
    if (this.graph[path[pos - 1]][v] == 0) {
      return false;
    }

    for (var i = 0; i < pos; i++)
      if (path[i] == v) {
        return false;
      }

    return true;
  }

  isCycle(path, pos) {
    if (pos == this.graph.length) {
      if (this.graph[path[pos - 1]][path[0]] == 1) {
        return true;
      } else {
        return false;
      }
    }

    for (var v = 1; v < this.graph.length; v++) {
      if (this.isSafe(v, path, pos)) {
        path[pos] = v;

        if (this.isCycle(path, pos + 1) == true) {
          return true;
        }

        path[pos] = -1;
      }
    }

    return false;
  }

  run() {
    this.path = new Array(this.graph.length).fill(0);
    for (var i = 0; i < this.graph.length; i++) this.path[i] = -1;

    this.path[0] = 0;
    if (this.isCycle(this.path, 1) == false) {
      return [];
    }

    return this.path;
  }
}
