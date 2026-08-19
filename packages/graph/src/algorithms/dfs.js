export function dfsFindPaths(graph, sourceAddress, targetAddress, options = {}) {
    const maxDepth = options.maxDepth ?? 10;
    const maxPaths = options.maxPaths ?? 50;
    const direction = options.direction || "forward";
    const start = sourceAddress.toLowerCase();
    const target = targetAddress ? targetAddress.toLowerCase() : undefined;
    const visitedNodes = [];
    const cycles = [];
    const pathsToTarget = [];
    const currentPath = [];
    const currentPathSet = new Set();
    function explore(current, depth) {
        if (depth > maxDepth)
            return;
        if (pathsToTarget.length >= maxPaths)
            return;
        visitedNodes.push(current);
        currentPath.push(current);
        currentPathSet.add(current);
        if (target && current === target) {
            pathsToTarget.push([...currentPath]);
        }
        const neighbors = direction === "forward"
            ? graph.getOutgoingNeighbors(current)
            : graph.getIncomingNeighbors(current);
        for (const neighbor of neighbors) {
            if (currentPathSet.has(neighbor)) {
                // Cycle detected
                const cycleStartIndex = currentPath.indexOf(neighbor);
                const cycle = [...currentPath.slice(cycleStartIndex), neighbor];
                if (cycles.length < 20) {
                    cycles.push(cycle);
                }
            }
            else {
                explore(neighbor, depth + 1);
            }
        }
        currentPath.pop();
        currentPathSet.delete(current);
    }
    explore(start, 0);
    return {
        visitedNodes: Array.from(new Set(visitedNodes)),
        cycles,
        pathsToTarget,
    };
}
//# sourceMappingURL=dfs.js.map