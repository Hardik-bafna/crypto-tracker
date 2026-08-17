import { TransactionGraph } from "../graph-model.js";
import { GraphNode } from "@crypto-tracer/types";

export interface BFSResult {
  visitedNodes: string[];
  depthMap: Map<string, number>;
  predecessorMap: Map<string, string>;
}

export function bfs(
  graph: TransactionGraph,
  startAddress: string,
  options: {
    direction?: "forward" | "backward" | "both";
    maxDepth?: number;
    maxNodes?: number;
  } = {}
): BFSResult {
  const direction = options.direction || "forward";
  const maxDepth = options.maxDepth ?? Infinity;
  const maxNodes = options.maxNodes ?? 1000;

  const start = startAddress.toLowerCase();
  const queue: { address: string; depth: number }[] = [{ address: start, depth: 0 }];
  const visited = new Set<string>([start]);
  const depthMap = new Map<string, number>([[start, 0]]);
  const predecessorMap = new Map<string, string>();
  const visitedOrder: string[] = [];

  while (queue.length > 0 && visitedOrder.length < maxNodes) {
    const { address, depth } = queue.shift()!;
    visitedOrder.push(address);

    if (depth >= maxDepth) continue;

    let neighbors: string[] = [];
    if (direction === "forward" || direction === "both") {
      neighbors.push(...graph.getOutgoingNeighbors(address));
    }
    if (direction === "backward" || direction === "both") {
      neighbors.push(...graph.getIncomingNeighbors(address));
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        depthMap.set(neighbor, depth + 1);
        predecessorMap.set(neighbor, address);
        queue.push({ address: neighbor, depth: depth + 1 });
      }
    }
  }

  return {
    visitedNodes: visitedOrder,
    depthMap,
    predecessorMap,
  };
}
