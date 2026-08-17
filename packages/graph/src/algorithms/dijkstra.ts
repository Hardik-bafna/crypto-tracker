import { TransactionGraph } from "../graph-model";
import { GraphEdge, PathResult } from "@crypto-tracer/types";

export function dijkstraShortestPath(
  graph: TransactionGraph,
  sourceAddress: string,
  targetAddress: string,
  weightFn?: (edge: GraphEdge) => number
): PathResult | null {
  const start = sourceAddress.toLowerCase();
  const target = targetAddress.toLowerCase();

  if (!graph.hasNode(start) || !graph.hasNode(target)) {
    return null;
  }

  // Default weight is 1.0 per hop
  const getWeight = weightFn || (() => 1.0);

  const distances = new Map<string, number>();
  const previousNode = new Map<string, string>();
  const previousEdge = new Map<string, GraphEdge>();
  const unvisited = new Set<string>();

  for (const node of graph.getAllNodes()) {
    distances.set(node.address.toLowerCase(), Infinity);
    unvisited.add(node.address.toLowerCase());
  }

  distances.set(start, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const nodeAddr of unvisited) {
      const dist = distances.get(nodeAddr) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        current = nodeAddr;
      }
    }

    if (!current || minDistance === Infinity) break;
    if (current === target) break;

    unvisited.delete(current);

    const outgoingEdges = graph.getOutgoingEdges(current);
    for (const edge of outgoingEdges) {
      const neighbor = edge.target.toLowerCase();
      if (!unvisited.has(neighbor)) continue;

      const alt = minDistance + getWeight(edge);
      if (alt < (distances.get(neighbor) ?? Infinity)) {
        distances.set(neighbor, alt);
        previousNode.set(neighbor, current);
        previousEdge.set(neighbor, edge);
      }
    }
  }

  if ((distances.get(target) ?? Infinity) === Infinity) {
    return null; // No path exists
  }

  // Reconstruct path
  const pathNodes: string[] = [];
  const pathEdges: GraphEdge[] = [];
  let curr: string | undefined = target;

  while (curr && curr !== start) {
    pathNodes.unshift(curr);
    const edge = previousEdge.get(curr);
    if (edge) pathEdges.unshift(edge);
    curr = previousNode.get(curr);
  }
  pathNodes.unshift(start);

  let totalAmountBig = 0;
  let asset = pathEdges[0]?.asset || "ETH";
  let hasMixer = false;
  let hasBridge = false;

  for (const edge of pathEdges) {
    const val = parseFloat(edge.amount) || 0;
    totalAmountBig += val;
    if (edge.isCrossChain || edge.bridgeName) hasBridge = true;
    const targetNode = graph.getNode(edge.target);
    if (targetNode?.entityType === "MIXER") hasMixer = true;
    if (targetNode?.entityType === "BRIDGE") hasBridge = true;
  }

  const startTime = pathEdges[0]?.timestamp.getTime() || 0;
  const endTime = pathEdges[pathEdges.length - 1]?.timestamp.getTime() || 0;
  const timeSpanSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));

  const targetNode = graph.getNode(target);

  return {
    nodes: pathNodes,
    edges: pathEdges,
    totalAmount: totalAmountBig.toString(),
    asset,
    hopCount: pathEdges.length,
    timeSpanSeconds,
    hasMixer,
    hasBridge,
    destinationEntity: targetNode?.entityName,
  };
}
