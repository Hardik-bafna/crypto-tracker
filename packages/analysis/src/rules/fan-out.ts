import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult, Evidence } from "@crypto-tracer/types";

export function detectFanOut(
  graph: TransactionGraph,
  options: { threshold?: number; windowSeconds?: number } = {}
): PatternDetectionResult[] {
  const threshold = options.threshold ?? 4;
  const windowSeconds = options.windowSeconds ?? 86400; // 24 hours
  const results: PatternDetectionResult[] = [];

  for (const node of graph.getAllNodes()) {
    const outgoingEdges = graph.getOutgoingEdges(node.address);
    if (outgoingEdges.length < threshold) continue;

    const uniqueRecipients = new Set(outgoingEdges.map((e) => e.target.toLowerCase()));
    if (uniqueRecipients.size >= threshold) {
      const timestamps = outgoingEdges.map((e) => e.timestamp.getTime()).sort((a, b) => a - b);
      const timeSpanSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;

      if (timeSpanSec <= windowSeconds) {
        const evidenceId = `ev-fanout-${node.address.slice(0, 8)}-${Date.now()}`;
        const totalVolume = outgoingEdges.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
        const asset = outgoingEdges[0]?.asset || "ETH";

        const evidence: Evidence = {
          id: evidenceId,
          type: "FAN_OUT_DISPERSAL",
          title: `Rapid Fan-Out Dispersal (${uniqueRecipients.size} Destinations)`,
          description: `Wallet ${node.address} rapidly dispersed funds across ${uniqueRecipients.size} distinct recipient addresses within ${Math.round(timeSpanSec / 60)} minutes. Total volume: ${totalVolume} ${asset}.`,
          confidence: 0.88,
          severity: uniqueRecipients.size >= 8 ? "HIGH" : "MEDIUM",
          source: "Pattern Detection Rule Engine",
          timestamp: new Date(),
          transactionHashes: outgoingEdges.map((e) => e.txHash),
          addresses: [node.address, ...Array.from(uniqueRecipients)],
          metadata: {
            recipientCount: uniqueRecipients.size,
            timeSpanMinutes: Math.round(timeSpanSec / 60),
            totalVolume,
          },
        };

        results.push({
          ruleId: "RULE_FAN_OUT",
          patternType: "FAN_OUT",
          title: `Fan-Out Distribution Detected on ${node.label || node.address.slice(0, 8)}`,
          description: `Wallet dispersed funds to ${uniqueRecipients.size} distinct addresses within a short timeframe, characteristic of fund structuring or smurfing.`,
          severity: uniqueRecipients.size >= 8 ? 75 : 55,
          confidence: 0.88,
          evidence: [evidence],
          affectedAddresses: [node.address, ...Array.from(uniqueRecipients)],
          affectedTxHashes: outgoingEdges.map((e) => e.txHash),
          metrics: { recipientCount: uniqueRecipients.size, totalVolume },
        });
      }
    }
  }

  return results;
}
