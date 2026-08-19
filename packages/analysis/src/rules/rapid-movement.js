export function detectRapidMovement(graph, options = {}) {
    const maxIntervalSec = options.maxIntervalSeconds ?? 3600; // 60 mins
    const minHops = options.minHops ?? 3;
    const results = [];
    const reportedPaths = new Set();
    for (const node of graph.getAllNodes()) {
        const inEdges = graph.getIncomingEdges(node.address);
        const outEdges = graph.getOutgoingEdges(node.address);
        for (const inEdge of inEdges) {
            for (const outEdge of outEdges) {
                const deltaSeconds = (outEdge.timestamp.getTime() - inEdge.timestamp.getTime()) / 1000;
                if (deltaSeconds >= 0 && deltaSeconds <= maxIntervalSec) {
                    const pathKey = `${inEdge.source}->${node.address}->${outEdge.target}`;
                    if (!reportedPaths.has(pathKey)) {
                        reportedPaths.add(pathKey);
                        const evidenceId = `ev-rapid-${node.address.slice(0, 8)}-${Date.now()}`;
                        const evidence = {
                            id: evidenceId,
                            type: "RAPID_TRANSIT_VELOCITY",
                            title: `High Velocity Fund Transit (${Math.round(deltaSeconds / 60)} min holding time)`,
                            description: `Funds received at ${node.address} were forwarded onward to ${outEdge.target} within ${Math.round(deltaSeconds / 60)} minutes (In: ${inEdge.formattedAmount}, Out: ${outEdge.formattedAmount}). Holding period is significantly below standard commerce behavior.`,
                            confidence: 0.9,
                            severity: deltaSeconds <= 600 ? "HIGH" : "MEDIUM",
                            source: "Velocity Analyzer",
                            timestamp: outEdge.timestamp,
                            transactionHashes: [inEdge.txHash, outEdge.txHash],
                            addresses: [inEdge.source, node.address, outEdge.target],
                            metadata: {
                                transitSeconds: deltaSeconds,
                                inAmount: inEdge.formattedAmount,
                                outAmount: outEdge.formattedAmount,
                            },
                        };
                        results.push({
                            ruleId: "RULE_RAPID_MOVEMENT",
                            patternType: "RAPID_MOVEMENT",
                            title: `Rapid Velocity Movement at ${node.label || node.address.slice(0, 8)}`,
                            description: `Automated or immediate relaying of incoming funds within ${Math.round(deltaSeconds / 60)} minutes.`,
                            severity: deltaSeconds <= 600 ? 70 : 50,
                            confidence: 0.9,
                            evidence: [evidence],
                            affectedAddresses: [inEdge.source, node.address, outEdge.target],
                            affectedTxHashes: [inEdge.txHash, outEdge.txHash],
                            metrics: { transitMinutes: Math.round(deltaSeconds / 60) },
                        });
                    }
                }
            }
        }
    }
    return results;
}
//# sourceMappingURL=rapid-movement.js.map