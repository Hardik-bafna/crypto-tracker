import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult, Evidence } from "@crypto-tracer/types";

export function detectPeelChain(
  graph: TransactionGraph,
  options: { minHops?: number; peelRatioThreshold?: number } = {}
): PatternDetectionResult[] {
  const minHops = options.minHops ?? 2;
  const peelRatioThreshold = options.peelRatioThreshold ?? 0.7; // At least 70% forwarded
  const results: PatternDetectionResult[] = [];
  const visitedChains = new Set<string>();

  for (const node of graph.getAllNodes()) {
    let current = node.address.toLowerCase();
    const chainHops: { from: string; to: string; txHash: string; forwardedAmount: number; ratio: number }[] = [];
    const visitedInPath = new Set<string>([current]);

    while (true) {
      const outEdges = graph.getOutgoingEdges(current);
      if (outEdges.length === 0) break;

      const inEdges = graph.getIncomingEdges(current);
      if (chainHops.length === 0 && inEdges.length === 0 && !node.isTarget) {
        // Can start from target or any intermediate node
      }

      // Find edge with largest amount
      let maxEdge = outEdges[0];
      let maxAmt = parseFloat(maxEdge.amount) || 0;
      let totalOut = 0;

      for (const e of outEdges) {
        const val = parseFloat(e.amount) || 0;
        totalOut += val;
        if (val > maxAmt) {
          maxAmt = val;
          maxEdge = e;
        }
      }

      const ratio = totalOut > 0 ? maxAmt / totalOut : 1.0;
      const nextNode = maxEdge.target.toLowerCase();

      if (ratio >= peelRatioThreshold && !visitedInPath.has(nextNode)) {
        chainHops.push({
          from: current,
          to: nextNode,
          txHash: maxEdge.txHash,
          forwardedAmount: maxAmt,
          ratio,
        });
        visitedInPath.add(nextNode);
        current = nextNode;
      } else {
        break;
      }
    }

    if (chainHops.length >= minHops) {
      const chainKey = chainHops.map((h) => h.from).join("->");
      if (!visitedChains.has(chainKey)) {
        visitedChains.add(chainKey);

        const affectedAddrs = [node.address, ...chainHops.map((h) => h.to)];
        const affectedTxs = chainHops.map((h) => h.txHash);
        const evidenceId = `ev-peel-${node.address.slice(0, 8)}-${Date.now()}`;

        const evidence: Evidence = {
          id: evidenceId,
          type: "PEEL_CHAIN_DISPERSAL",
          title: `Peel Chain Pattern Identified (${chainHops.length} Sequential Hops)`,
          description: `Sequential fund forwarding observed across ${chainHops.length} hops starting from ${node.address}. In each step, the dominant portion of funds (avg ${Math.round((chainHops.reduce((acc, h) => acc + h.ratio, 0) / chainHops.length) * 100)}%) was forwarded to a fresh address while peeling off smaller amounts.`,
          confidence: 0.92,
          severity: chainHops.length >= 4 ? "CRITICAL" : "HIGH",
          source: "Heuristic Peel Chain Analyzer",
          timestamp: new Date(),
          transactionHashes: affectedTxs,
          addresses: affectedAddrs,
          metadata: {
            hopsCount: chainHops.length,
            averageForwardRatio: chainHops.reduce((acc, h) => acc + h.ratio, 0) / chainHops.length,
          },
        };

        results.push({
          ruleId: "RULE_PEEL_CHAIN",
          patternType: "PEEL_CHAIN",
          title: `Peel Chain Structure (${chainHops.length} Hops)`,
          description: `Layered fund laundering signature detected: ${chainHops.length} sequential transactions systematically forwarding high percentage of balances.`,
          severity: chainHops.length >= 4 ? 85 : 70,
          confidence: 0.92,
          evidence: [evidence],
          affectedAddresses: affectedAddrs,
          affectedTxHashes: affectedTxs,
          metrics: { hops: chainHops.length },
        });
      }
    }
  }

  return results;
}
