import { TransactionGraph } from "../graph-model";
export function nHopTraversal(graph, originAddress, options) {
    const resultGraph = new TransactionGraph();
    const start = originAddress.toLowerCase();
    const startNode = graph.getNode(start);
    if (!startNode) {
        return {
            graph: resultGraph,
            data: { nodes: [], edges: [] },
            hopStats: [],
            totalVolume: "0",
            maxHopReached: 0,
        };
    }
    resultGraph.addNode({ ...startNode, isTarget: true, hopLevel: 0 });
    const maxHops = options.maxHops || 5;
    const maxNodes = options.maxNodes || 500;
    const direction = options.direction || "forward";
    let currentLayer = new Set([start]);
    const visited = new Set([start]);
    const hopStats = [];
    let totalVolumeNum = 0;
    for (let hop = 1; hop <= maxHops; hop++) {
        const nextLayer = new Set();
        let hopEdgeCount = 0;
        let hopVolumeNum = 0;
        for (const currentAddr of currentLayer) {
            if (resultGraph.getNodeCount() >= maxNodes)
                break;
            const edgesToConsider = [];
            if (direction === "forward" || direction === "both") {
                edgesToConsider.push(...graph.getOutgoingEdges(currentAddr));
            }
            if (direction === "backward" || direction === "both") {
                edgesToConsider.push(...graph.getIncomingEdges(currentAddr));
            }
            for (const edge of edgesToConsider) {
                // Amount filter
                if (options.minAmount) {
                    const val = parseFloat(edge.amount);
                    const min = parseFloat(options.minAmount);
                    if (!isNaN(val) && !isNaN(min) && val < min)
                        continue;
                }
                if (options.asset && edge.asset.toUpperCase() !== options.asset.toUpperCase()) {
                    continue;
                }
                if (options.startTime && edge.timestamp < options.startTime)
                    continue;
                if (options.endTime && edge.timestamp > options.endTime)
                    continue;
                const otherAddr = edge.source.toLowerCase() === currentAddr.toLowerCase()
                    ? edge.target.toLowerCase()
                    : edge.source.toLowerCase();
                const otherNode = graph.getNode(otherAddr);
                if (otherNode) {
                    resultGraph.addNode({ ...otherNode, hopLevel: hop });
                    resultGraph.addEdge(edge);
                    hopEdgeCount++;
                    const val = parseFloat(edge.formattedAmount || edge.amount) || 0;
                    hopVolumeNum += val;
                    totalVolumeNum += val;
                    if (!visited.has(otherAddr)) {
                        nextLayer.add(otherAddr);
                        visited.add(otherAddr);
                    }
                }
            }
        }
        hopStats.push({
            hop,
            nodeCount: nextLayer.size,
            edgeCount: hopEdgeCount,
            volume: hopVolumeNum.toFixed(4),
        });
        currentLayer = nextLayer;
        if (currentLayer.size === 0 || resultGraph.getNodeCount() >= maxNodes) {
            break;
        }
    }
    return {
        graph: resultGraph,
        data: resultGraph.toJSON(),
        hopStats,
        totalVolume: totalVolumeNum.toFixed(4),
        maxHopReached: hopStats.length,
    };
}
//# sourceMappingURL=n-hop.js.map