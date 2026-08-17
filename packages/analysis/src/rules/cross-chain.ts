import { TransactionGraph } from "@crypto-tracer/graph";
import { EntityDatabase } from "@crypto-tracer/entities";
import { PatternDetectionResult, Evidence } from "@crypto-tracer/types";

export function detectCrossChain(
  graph: TransactionGraph,
  entityDb: EntityDatabase
): PatternDetectionResult[] {
  const results: PatternDetectionResult[] = [];
  const processed = new Set<string>();

  for (const edge of graph.getAllEdges()) {
    const targetKnown = entityDb.getEntityByAddress(edge.target);
    const isBridge = edge.isCrossChain || targetKnown?.entity.type === "BRIDGE";

    if (isBridge && !processed.has(edge.txHash)) {
      processed.add(edge.txHash);
      const bridgeName = edge.bridgeName || targetKnown?.entity.name || "Cross-Chain Bridge";
      const evidenceId = `ev-bridge-${edge.txHash.slice(0, 8)}`;

      const evidence: Evidence = {
        id: evidenceId,
        type: "CROSS_CHAIN_BRIDGE_TRANSFER",
        title: `Cross-Chain Routing via ${bridgeName}`,
        description: `Funds totaling ${edge.formattedAmount} were routed through ${bridgeName} (${edge.target}). Bridge interactions represent chain-hopping evasion tactics.`,
        confidence: 0.94,
        severity: "HIGH",
        source: "Cross-Chain Routing Analyzer",
        timestamp: edge.timestamp,
        transactionHashes: [edge.txHash],
        addresses: [edge.source, edge.target],
        metadata: {
          bridgeName,
          chain: edge.chain,
          amount: edge.formattedAmount,
        },
      };

      results.push({
        ruleId: "RULE_CROSS_CHAIN",
        patternType: "BRIDGE_INTERACTION",
        title: `Cross-Chain Bridge: ${bridgeName}`,
        description: `Cryptocurrency routed through bridge protocol ${bridgeName} to transfer funds across separate blockchain networks.`,
        severity: 70,
        confidence: 0.94,
        evidence: [evidence],
        affectedAddresses: [edge.source, edge.target],
        affectedTxHashes: [edge.txHash],
        metrics: { bridge: bridgeName },
      });
    }
  }

  return results;
}
