import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult, Evidence } from "@crypto-tracer/types";

export function detectHighHop(
  graph: TransactionGraph,
  options: { threshold?: number } = {}
): PatternDetectionResult[] {
  const threshold = options.threshold ?? 5;
  const results: PatternDetectionResult[] = [];

  // Find target or root nodes
  const targetNodes = graph.getAllNodes().filter((n) => n.isTarget);
  const startAddresses = targetNodes.length > 0
    ? targetNodes.map((n) => n.address)
    : graph.getAllNodes().filter((n) => graph.getIncomingEdges(n.address).length === 0).map((n) => n.address);

  for (const startAddr of startAddresses) {
    const queue: { address: string; depth: number; path: string[]; txs: string[] }[] = [
      { address: startAddr.toLowerCase(), depth: 0, path: [startAddr], txs: [] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= threshold) {
        const evidenceId = `ev-highhop-${startAddr.slice(0, 8)}-${current.depth}`;
        const evidence: Evidence = {
          id: evidenceId,
          type: "HIGH_HOP_LAYERING",
          title: `Extended Laundering Chain (${current.depth} Hops)`,
          description: `Funds originated from ${startAddr} have traversed ${current.depth} intermediary hops to reach ${current.address}. Such extended layering is typical in obfuscation attempts.`,
          confidence: 0.85,
          severity: current.depth >= 7 ? "CRITICAL" : "HIGH",
          source: "Hop Analyzer",
          timestamp: new Date(),
          transactionHashes: current.txs,
          addresses: current.path,
          metadata: { totalHops: current.depth },
        };

        results.push({
          ruleId: "RULE_HIGH_HOP",
          patternType: "HIGH_HOP_MOVEMENT",
          title: `Deep Hop Layering (${current.depth} Hops)`,
          description: `Funds routed through ${current.depth} sequential intermediary addresses from suspect origin.`,
          severity: current.depth >= 7 ? 80 : 65,
          confidence: 0.85,
          evidence: [evidence],
          affectedAddresses: current.path,
          affectedTxHashes: current.txs,
          metrics: { hops: current.depth },
        });
        break; // One alert per root is sufficient
      }

      const outEdges = graph.getOutgoingEdges(current.address);
      for (const edge of outEdges) {
        const next = edge.target.toLowerCase();
        if (!current.path.includes(next) && !visited.has(next)) {
          visited.add(next);
          queue.push({
            address: next,
            depth: current.depth + 1,
            path: [...current.path, next],
            txs: [...current.txs, edge.txHash],
          });
        }
      }
    }
  }

  return results;
}
