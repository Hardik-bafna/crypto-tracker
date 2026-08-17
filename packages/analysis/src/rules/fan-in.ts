import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult, Evidence } from "@crypto-tracer/types";

export function detectFanIn(
  graph: TransactionGraph,
  options: { threshold?: number; windowSeconds?: number } = {}
): PatternDetectionResult[] {
  const threshold = options.threshold ?? 4;
  const windowSeconds = options.windowSeconds ?? 86400;
  const results: PatternDetectionResult[] = [];

  for (const node of graph.getAllNodes()) {
    const incomingEdges = graph.getIncomingEdges(node.address);
    if (incomingEdges.length < threshold) continue;

    const uniqueSenders = new Set(incomingEdges.map((e) => e.source.toLowerCase()));
    if (uniqueSenders.size >= threshold) {
      const timestamps = incomingEdges.map((e) => e.timestamp.getTime()).sort((a, b) => a - b);
      const timeSpanSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;

      if (timeSpanSec <= windowSeconds) {
        const evidenceId = `ev-fanin-${node.address.slice(0, 8)}-${Date.now()}`;
        const totalVolume = incomingEdges.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
        const asset = incomingEdges[0]?.asset || "BTC";

        const evidence: Evidence = {
          id: evidenceId,
          type: "FAN_IN_CONSOLIDATION",
          title: `Fan-In Consolidation (${uniqueSenders.size} Inflow Sources)`,
          description: `Collector wallet ${node.address} aggregated funds from ${uniqueSenders.size} separate source wallets within ${Math.round(timeSpanSec / 60)} minutes. Total inflow: ${totalVolume} ${asset}.`,
          confidence: 0.85,
          severity: uniqueSenders.size >= 8 ? "HIGH" : "MEDIUM",
          source: "Pattern Detection Rule Engine",
          timestamp: new Date(),
          transactionHashes: incomingEdges.map((e) => e.txHash),
          addresses: [node.address, ...Array.from(uniqueSenders)],
          metadata: {
            senderCount: uniqueSenders.size,
            timeSpanMinutes: Math.round(timeSpanSec / 60),
            totalVolume,
          },
        };

        results.push({
          ruleId: "RULE_FAN_IN",
          patternType: "FAN_IN",
          title: `Fan-In Consolidation Detected on ${node.label || node.address.slice(0, 8)}`,
          description: `Wallet received aggregated inflows from ${uniqueSenders.size} distinct sources, indicative of mule harvesting or payment collection.`,
          severity: uniqueSenders.size >= 8 ? 70 : 50,
          confidence: 0.85,
          evidence: [evidence],
          affectedAddresses: [node.address, ...Array.from(uniqueSenders)],
          affectedTxHashes: incomingEdges.map((e) => e.txHash),
          metrics: { senderCount: uniqueSenders.size, totalVolume },
        });
      }
    }
  }

  return results;
}
