import { TransactionGraph } from "../graph-model";
import {
  GraphNode,
  GraphEdge,
  TracePathOptions,
  TracePathDetail,
} from "@crypto-tracer/types";

/**
 * Discovers multiple paths through an existing TransactionGraph from startAddress
 * to target destination (or any cash-out/known entity destination).
 * Reuses graph traversal logic without performing new external API calls.
 */
export function findMultipleTracePaths(
  graph: TransactionGraph,
  options: TracePathOptions
): TracePathDetail[] {
  const start = options.startAddress.toLowerCase();
  if (!graph.hasNode(start)) return [];

  const maxHops = options.maxHops || 6;
  const minAmount = options.minAmount || 0;
  const destAddr = options.destinationAddress?.toLowerCase();
  const destEntityType = options.destinationEntityType?.toUpperCase();

  // Find all matching target nodes if destination is specific or generic (e.g. any EXCHANGE)
  const isTargetNode = (node: GraphNode): boolean => {
    if (node.address.toLowerCase() === start) return false;
    if (destAddr) return node.address.toLowerCase() === destAddr;
    if (destEntityType) return node.entityType?.toUpperCase() === destEntityType;
    // Default fallback: any known entity or node with 0 outgoing edges (endpoint)
    return !!node.entityType || graph.getOutgoingEdges(node.address).length === 0;
  };

  // Find paths using DFS traversal bounded by maxHops and minAmount
  const foundPaths: { nodes: GraphNode[]; edges: GraphEdge[] }[] = [];
  const MAX_PATHS = 5;

  function dfsPathSearch(
    currentAddr: string,
    currentPathNodes: GraphNode[],
    currentPathEdges: GraphEdge[],
    visited: Set<string>
  ) {
    if (foundPaths.length >= MAX_PATHS) return;
    if (currentPathEdges.length > maxHops) return;

    const currentNode = graph.getNode(currentAddr);
    if (!currentNode) return;

    // Check if current node is a target destination (after at least 1 hop)
    if (currentPathEdges.length > 0 && isTargetNode(currentNode)) {
      foundPaths.push({
        nodes: [...currentPathNodes],
        edges: [...currentPathEdges],
      });
      if (destAddr) return; // If specific target found, stop expanding this branch
    }

    if (currentPathEdges.length >= maxHops) return;

    const outgoing = graph.getOutgoingEdges(currentAddr);
    for (const edge of outgoing) {
      if (foundPaths.length >= MAX_PATHS) break;

      const amtVal = parseFloat(edge.formattedAmount || edge.amount) || 0;
      if (minAmount > 0 && amtVal < minAmount) continue;

      const nextAddr = edge.target.toLowerCase();
      if (visited.has(nextAddr)) continue; // Avoid circular loops

      const nextNode = graph.getNode(nextAddr);
      if (!nextNode) continue;

      visited.add(nextAddr);
      currentPathNodes.push(nextNode);
      currentPathEdges.push(edge);

      dfsPathSearch(nextAddr, currentPathNodes, currentPathEdges, visited);

      currentPathNodes.pop();
      currentPathEdges.pop();
      visited.delete(nextAddr);
    }
  }

  const startNode = graph.getNode(start);
  if (!startNode) return [];

  const visitedSet = new Set<string>([start]);
  dfsPathSearch(start, [startNode], [], visitedSet);

  // Map raw paths to detailed TracePathDetail metrics
  return foundPaths.map((path, index) => {
    let totalVolume = 0;
    const asset = path.edges[0]?.asset || "ETH";
    const knownEntities = new Set<string>();
    const suspiciousIndicators = new Set<string>();

    for (const node of path.nodes) {
      if (node.entityName) knownEntities.add(node.entityName);
      if (node.entityType === "MIXER") suspiciousIndicators.add("Privacy Mixer Interaction");
      if (node.entityType === "BRIDGE") suspiciousIndicators.add("Cross-Chain Bridge Routing");
      if (node.tags?.includes("ILLICIT")) suspiciousIndicators.add("Flagged Illicit Entity");
    }

    for (const edge of path.edges) {
      const val = parseFloat(edge.formattedAmount || edge.amount) || 0;
      totalVolume += val;
      if (edge.isCrossChain || edge.bridgeName) {
        suspiciousIndicators.add(`Cross-Chain Bridge: ${edge.bridgeName || "Bridge"}`);
      }
    }

    const firstTime = path.edges[0]?.timestamp ? new Date(path.edges[0].timestamp).getTime() : 0;
    const lastTime = path.edges[path.edges.length - 1]?.timestamp
      ? new Date(path.edges[path.edges.length - 1].timestamp).getTime()
      : 0;
    const timeSpanSeconds = Math.max(0, Math.round((lastTime - firstTime) / 1000));

    if (timeSpanSeconds > 0 && timeSpanSeconds < 1800) {
      suspiciousIndicators.add("Rapid Velocity Movement (< 30 mins)");
    }
    if (path.edges.length >= 4) {
      suspiciousIndicators.add("High-Hop Layering");
    }

    return {
      id: `path-${index + 1}-${start.slice(0, 6)}`,
      pathIndex: index + 1,
      nodes: path.nodes,
      edges: path.edges,
      hopCount: path.edges.length,
      totalVolume: parseFloat(totalVolume.toFixed(4)),
      asset,
      timeSpanSeconds,
      knownEntities: Array.from(knownEntities),
      suspiciousIndicators: Array.from(suspiciousIndicators),
    };
  });
}
