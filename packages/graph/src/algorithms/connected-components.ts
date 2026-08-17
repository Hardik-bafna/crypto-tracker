import { TransactionGraph } from "../graph-model.js";

export function findConnectedComponents(graph: TransactionGraph): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of graph.getAllNodes()) {
    const start = node.address.toLowerCase();
    if (visited.has(start)) continue;

    const component: string[] = [];
    const queue: string[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      const neighbors = [
        ...graph.getOutgoingNeighbors(current),
        ...graph.getIncomingNeighbors(current),
      ];

      for (const neighbor of neighbors) {
        const lower = neighbor.toLowerCase();
        if (!visited.has(lower)) {
          visited.add(lower);
          queue.push(lower);
        }
      }
    }

    components.push(component);
  }

  return components.sort((a, b) => b.length - a.length);
}
