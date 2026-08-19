export function bfs(graph, startAddress, options = {}) {
    const direction = options.direction || "forward";
    const maxDepth = options.maxDepth ?? Infinity;
    const maxNodes = options.maxNodes ?? 1000;
    const start = startAddress.toLowerCase();
    const queue = [{ address: start, depth: 0 }];
    const visited = new Set([start]);
    const depthMap = new Map([[start, 0]]);
    const predecessorMap = new Map();
    const visitedOrder = [];
    while (queue.length > 0 && visitedOrder.length < maxNodes) {
        const { address, depth } = queue.shift();
        visitedOrder.push(address);
        if (depth >= maxDepth)
            continue;
        let neighbors = [];
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
//# sourceMappingURL=bfs.js.map