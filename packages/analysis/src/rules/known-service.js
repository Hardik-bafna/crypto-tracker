export function detectKnownServiceInteractions(graph, entityDb) {
    const results = [];
    const processedEdges = new Set();
    for (const edge of graph.getAllEdges()) {
        if (processedEdges.has(edge.id))
            continue;
        processedEdges.add(edge.id);
        const sourceKnown = entityDb.getEntityByAddress(edge.source);
        const targetKnown = entityDb.getEntityByAddress(edge.target);
        // 1. Check Mixer Interaction
        if (targetKnown?.entity.type === "MIXER" || sourceKnown?.entity.type === "MIXER") {
            const mixer = (targetKnown?.entity.type === "MIXER" ? targetKnown : sourceKnown);
            const isDeposit = targetKnown?.entity.type === "MIXER";
            const evidenceId = `ev-mixer-${edge.txHash.slice(0, 8)}`;
            const evidence = {
                id: evidenceId,
                type: "MIXER_INTERACTION",
                title: `${mixer.entity.name} Privacy Pool ${isDeposit ? "Deposit" : "Withdrawal"}`,
                description: `Direct transaction of ${edge.formattedAmount} ${isDeposit ? "into" : "from"} known privacy mixer ${mixer.entity.name} (${mixer.mapping.label || mixer.mapping.address}). Verified source: ${mixer.mapping.source}.`,
                confidence: 0.98,
                severity: "CRITICAL",
                source: mixer.mapping.source,
                timestamp: edge.timestamp,
                transactionHashes: [edge.txHash],
                addresses: [edge.source, edge.target],
                metadata: {
                    mixerName: mixer.entity.name,
                    mixerAddress: mixer.mapping.address,
                    direction: isDeposit ? "deposit" : "withdrawal",
                    amount: edge.formattedAmount,
                },
            };
            results.push({
                ruleId: "RULE_MIXER_INTERACTION",
                patternType: "MIXER_INTERACTION",
                title: `Mixer Interaction: ${mixer.entity.name}`,
                description: `Cryptocurrency moved through sanctioned privacy protocol ${mixer.entity.name}, intentionally obscuring transaction provenance.`,
                severity: 95,
                confidence: 0.98,
                evidence: [evidence],
                affectedAddresses: [edge.source, edge.target],
                affectedTxHashes: [edge.txHash],
                metrics: { mixer: mixer.entity.name },
            });
        }
        // 2. Check Known Illicit Interaction
        if (targetKnown?.entity.type === "KNOWN_ILLICIT" || sourceKnown?.entity.type === "KNOWN_ILLICIT") {
            const illicit = (targetKnown?.entity.type === "KNOWN_ILLICIT" ? targetKnown : sourceKnown);
            const evidenceId = `ev-illicit-${edge.txHash.slice(0, 8)}`;
            const evidence = {
                id: evidenceId,
                type: "KNOWN_ILLICIT_INTERACTION",
                title: `Interaction with Flagged Entity (${illicit.entity.name})`,
                description: `Direct fund flow of ${edge.formattedAmount} involving law-enforcement flagged illicit entity: ${illicit.entity.name} (${illicit.entity.description}). Source: ${illicit.mapping.source}.`,
                confidence: 0.95,
                severity: "CRITICAL",
                source: illicit.mapping.source,
                timestamp: edge.timestamp,
                transactionHashes: [edge.txHash],
                addresses: [edge.source, edge.target],
                metadata: {
                    entityName: illicit.entity.name,
                    category: illicit.entity.category,
                },
            };
            results.push({
                ruleId: "RULE_ILLICIT_INTERACTION",
                patternType: "ILLICIT_INTERACTION",
                title: `Illicit Flag: ${illicit.entity.name}`,
                description: `Wallet directly transacted with a confirmed law-enforcement target / darknet narcotics entity.`,
                severity: 98,
                confidence: 0.95,
                evidence: [evidence],
                affectedAddresses: [edge.source, edge.target],
                affectedTxHashes: [edge.txHash],
            });
        }
    }
    return results;
}
//# sourceMappingURL=known-service.js.map