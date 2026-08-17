import { describe, it, expect } from "bun:test";
import {
  TransactionGraph,
  bfs,
  dfsFindPaths,
  dijkstraShortestPath,
  findConnectedComponents,
  nHopTraversal,
  GraphBuilder,
} from "@crypto-tracer/graph";
import { SyntheticBlockchainAdapter } from "@crypto-tracer/blockchain";

describe("Graph Model & Algorithms", () => {
  const synth = new SyntheticBlockchainAdapter("ethereum");
  const allTxs = synth.getAllSyntheticTransactions();
  const graph = GraphBuilder.buildFromTransactions(allTxs);

  it("should build a valid multi-graph from transactions", () => {
    expect(graph.getNodeCount()).toBeGreaterThan(5);
    expect(graph.getEdgeCount()).toBeGreaterThan(5);
  });

  it("should perform BFS traversal with depth tracking", () => {
    const suspect = "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001";
    const result = bfs(graph, suspect, { direction: "forward", maxDepth: 4 });
    expect(result.visitedNodes.length).toBeGreaterThan(2);
    expect(result.depthMap.get(suspect.toLowerCase())).toBe(0);
  });

  it("should calculate Dijkstra shortest path between suspect and cashout exchange", () => {
    const suspect = "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001";
    const walletE = "0x66e75aa5e3f95b38f6c3fffe6436eb5462629983"; // Mixer withdrawal recipient
    const path = dijkstraShortestPath(graph, suspect, walletE);

    expect(path).not.toBeNull();
    if (path) {
      expect(path.nodes[0].toLowerCase()).toBe(suspect.toLowerCase());
      expect(path.hopCount).toBeGreaterThanOrEqual(2);
      expect(path.edges.length).toBe(path.hopCount);
    }
  });

  it("should identify connected components in the graph", () => {
    const components = findConnectedComponents(graph);
    expect(components.length).toBeGreaterThan(0);
    expect(components[0].length).toBeGreaterThan(3);
  });

  it("should perform bounded n-hop traversal with hop statistics", () => {
    const suspect = "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001";
    const traversal = nHopTraversal(graph, suspect, { direction: "forward", maxHops: 5 });

    expect(traversal.maxHopReached).toBeGreaterThanOrEqual(3);
    expect(traversal.data.nodes.length).toBeGreaterThan(3);
    expect(traversal.hopStats.length).toBeGreaterThan(0);
  });

  it("should filter graph by minimum amount", () => {
    const filtered = graph.filter({ minAmount: "100" });
    for (const edge of filtered.getAllEdges()) {
      const val = parseFloat(edge.amount);
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(100);
      }
    }
  });
});
