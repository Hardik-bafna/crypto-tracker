import { TransactionGraph } from "../graph-model";
import { GraphEdge, PathResult } from "@crypto-tracer/types";

export function compositeForensicWeight(
  edge: GraphEdge,
  graph: TransactionGraph
): number {
  const amount = parseFloat(edge.amount) || 0;
  // Volume Component: Larger transfer volume -> lower edge cost (prefer main money flow over dust)
  const volumeCost = 1.0 / (Math.log10(amount + 1) + 1);

  // Risk & Entity Component: High risk/obfuscation nodes -> lower cost (prefer paths through mixers/bridges/CEX)
  const targetNode = graph.getNode(edge.target);
  let riskScore = targetNode?.riskScore || 0;
  if (targetNode?.entityType === "MIXER" || targetNode?.tags?.includes("SANCTIONED")) {
    riskScore = Math.max(riskScore, 90);
  } else if (targetNode?.entityType === "BRIDGE" || edge.isCrossChain) {
    riskScore = Math.max(riskScore, 70);
  } else if (targetNode?.entityType === "EXCHANGE") {
    riskScore = Math.max(riskScore, 60);
  }
  const riskCost = 1.0 / (riskScore + 1.0);

  // Base Hop Penalty: Prevents infinite cycles and keeps path bounded
  const baseHopCost = 0.2;

  // Composite Weight Formula (50% Volume, 30% Risk, 20% Base Hop)
  return 0.5 * volumeCost + 0.3 * riskCost + 0.2 * baseHopCost;
}

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

  // Use Composite Forensic Weight function by default if no weightFn is provided
  const getWeight = weightFn || ((e: GraphEdge) => compositeForensicWeight(e, graph));

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
