import {
  TimelineEvent,
  TimelineEventType,
  GraphData,
  GraphNode,
  GraphEdge,
  PatternDetectionResult,
  SuspiciousPatternType,
} from "@crypto-tracer/types";

/**
 * Generates a curated investigation timeline from existing investigation data.
 * Only includes significant events — not every raw transaction.
 * All data is derived from the graph, patterns, and entities already available.
 */
export function generateTimeline(
  graph: GraphData,
  patterns: PatternDetectionResult[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const edges = [...graph.edges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const nodeMap = new Map<string, GraphNode>();
  for (const n of graph.nodes) {
    nodeMap.set(n.address.toLowerCase(), n);
  }

  // Helper: get entity display name for an address
  const entityName = (addr: string): string | undefined => {
    return nodeMap.get(addr.toLowerCase())?.entityName;
  };

  const shortAddr = (addr: string): string => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  // Helper: build a friendly label for a wallet
  const walletLabel = (addr: string): string => {
    const name = entityName(addr);
    return name ? name : shortAddr(addr);
  };

  // Compute median amount for "large transfer" detection
  const amounts = edges
    .map((e) => parseFloat(e.formattedAmount || e.amount) || 0)
    .filter((a) => a > 0);
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const medianAmount =
    sortedAmounts.length > 0
      ? sortedAmounts[Math.floor(sortedAmounts.length / 2)]
      : 0;
  const largeThreshold = medianAmount * 2.5;

  // Track which edges are already covered by pattern events
  const coveredEdgeIds = new Set<string>();
  const coveredTxHashes = new Set<string>();

  // --- 1. Pattern-derived events ---
  for (const pattern of patterns) {
    const patternEdges = edges.filter(
      (e) =>
        pattern.affectedTxHashes.includes(e.txHash) ||
        (pattern.affectedAddresses.includes(e.source) &&
          pattern.affectedAddresses.includes(e.target))
    );
    const timestamp =
      patternEdges.length > 0
        ? patternEdges[0].timestamp
        : pattern.evidence[0]?.timestamp || new Date();
    const relatedEdgeIds = patternEdges.map((e) => e.id);
    const relatedNodeIds = [
      ...new Set(patternEdges.flatMap((e) => [e.source.toLowerCase(), e.target.toLowerCase()])),
    ];

    patternEdges.forEach((e) => {
      coveredEdgeIds.add(e.id);
      coveredTxHashes.add(e.txHash);
    });

    const mapped = mapPatternToEvent(
      pattern,
      timestamp,
      patternEdges,
      relatedNodeIds,
      relatedEdgeIds,
      walletLabel
    );
    if (mapped) events.push(mapped);
  }

  // --- 2. Initial funds event (first edge chronologically) ---
  if (edges.length > 0) {
    const first = edges[0];
    events.push({
      id: `tl-initial-${first.id}`,
      timestamp: first.timestamp,
      eventType: "INITIAL_FUNDS",
      title: "First recorded transaction",
      description: `${walletLabel(first.source)} sent ${first.formattedAmount || first.amount} to ${walletLabel(first.target)}. This is the earliest transaction in the traced path.`,
      sourceAddress: first.source,
      sourceEntity: entityName(first.source),
      destinationAddress: first.target,
      destinationEntity: entityName(first.target),
      txHash: first.txHash,
      amount: first.formattedAmount || first.amount,
      asset: first.asset,
      severity: "MEDIUM",
      relatedNodeIds: [first.source.toLowerCase(), first.target.toLowerCase()],
      relatedEdgeIds: [first.id],
    });
    coveredEdgeIds.add(first.id);
  }

  // --- 3. Exchange interaction events (from entity-labeled nodes) ---
  const exchangeNodes = graph.nodes.filter((n) => n.entityType === "EXCHANGE");
  for (const exNode of exchangeNodes) {
    const addr = exNode.address.toLowerCase();
    // Find edges going TO this exchange
    const incomingEdges = edges.filter(
      (e) => e.target.toLowerCase() === addr && !coveredEdgeIds.has(e.id)
    );
    if (incomingEdges.length > 0) {
      const edge = incomingEdges[0];
      events.push({
        id: `tl-exchange-${edge.id}`,
        timestamp: edge.timestamp,
        eventType: "EXCHANGE_INTERACTION",
        title: `Funds reached ${exNode.entityName || "an exchange"}`,
        description: `${walletLabel(edge.source)} transferred ${edge.formattedAmount || edge.amount} to ${exNode.entityName || "a regulated exchange"}. This is a potential cash-out point where the identity of the account holder may be obtainable.`,
        sourceAddress: edge.source,
        sourceEntity: entityName(edge.source),
        destinationAddress: edge.target,
        destinationEntity: exNode.entityName,
        txHash: edge.txHash,
        amount: edge.formattedAmount || edge.amount,
        asset: edge.asset,
        severity: "HIGH",
        relatedNodeIds: [edge.source.toLowerCase(), addr],
        relatedEdgeIds: [edge.id],
      });
      coveredEdgeIds.add(edge.id);
    }
  }

  // --- 4. Large transfer events (exceeding 2.5× median) ---
  if (largeThreshold > 0) {
    for (const edge of edges) {
      if (coveredEdgeIds.has(edge.id)) continue;
      const amt = parseFloat(edge.formattedAmount || edge.amount) || 0;
      if (amt >= largeThreshold) {
        events.push({
          id: `tl-large-${edge.id}`,
          timestamp: edge.timestamp,
          eventType: "LARGE_TRANSFER",
          title: "Large value transfer",
          description: `${walletLabel(edge.source)} sent ${edge.formattedAmount || edge.amount} to ${walletLabel(edge.target)}. This transfer is significantly larger than the typical amount observed in this investigation.`,
          sourceAddress: edge.source,
          sourceEntity: entityName(edge.source),
          destinationAddress: edge.target,
          destinationEntity: entityName(edge.target),
          txHash: edge.txHash,
          amount: edge.formattedAmount || edge.amount,
          asset: edge.asset,
          severity: "MEDIUM",
          relatedNodeIds: [edge.source.toLowerCase(), edge.target.toLowerCase()],
          relatedEdgeIds: [edge.id],
        });
        coveredEdgeIds.add(edge.id);
      }
    }
  }

  // Sort all events chronologically
  events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return events;
}

/**
 * Maps a detected pattern to a timeline event with plain-language descriptions.
 */
function mapPatternToEvent(
  pattern: PatternDetectionResult,
  timestamp: Date,
  edges: GraphEdge[],
  relatedNodeIds: string[],
  relatedEdgeIds: string[],
  walletLabel: (addr: string) => string,
): TimelineEvent | null {
  const firstEdge = edges[0];
  const base = {
    id: `tl-pattern-${pattern.ruleId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp,
    txHash: firstEdge?.txHash,
    amount: firstEdge?.formattedAmount || firstEdge?.amount,
    asset: firstEdge?.asset,
    sourceAddress: firstEdge?.source,
    sourceEntity: firstEdge ? walletLabel(firstEdge.source) : undefined,
    destinationAddress: firstEdge?.target,
    destinationEntity: firstEdge ? walletLabel(firstEdge.target) : undefined,
    patternType: pattern.patternType,
    relatedNodeIds,
    relatedEdgeIds,
  };

  const typeMap: Record<SuspiciousPatternType, { eventType: TimelineEventType; title: string; description: string; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" } | null> = {
    MIXER_INTERACTION: {
      eventType: "MIXER_INTERACTION",
      title: "Privacy mixer interaction detected",
      description: `Funds were sent through a privacy mixer (${pattern.metrics?.mixer || "unknown"}). Mixers are designed to make it difficult to trace where money came from or went.`,
      severity: "CRITICAL",
    },
    BRIDGE_INTERACTION: {
      eventType: "BRIDGE_INTERACTION",
      title: "Cross-chain bridge transfer",
      description: `Funds were moved to a different blockchain network using a bridge service. This can make it harder to follow the money across chains.`,
      severity: "HIGH",
    },
    PEEL_CHAIN: {
      eventType: "PEEL_CHAIN",
      title: "Peel chain structure detected",
      description: `Funds were passed through a series of wallets, each skimming a small amount while forwarding the rest. This is a common technique to disguise the origin of money.`,
      severity: "HIGH",
    },
    FAN_OUT: {
      eventType: "FAN_OUT",
      title: "Funds split across multiple wallets",
      description: `A single wallet distributed funds across ${pattern.affectedAddresses.length} different addresses. Splitting money this way can be used to avoid detection thresholds.`,
      severity: "HIGH",
    },
    FAN_IN: {
      eventType: "FAN_IN",
      title: "Funds collected from multiple wallets",
      description: `Multiple wallets sent funds into a single address, consolidating previously split amounts. This often occurs before cashing out.`,
      severity: "HIGH",
    },
    RAPID_MOVEMENT: {
      eventType: "RAPID_ACTIVITY",
      title: "Rapid transaction activity",
      description: `Funds moved through multiple wallets in quick succession (under 30 minutes between transfers). This speed suggests automated or pre-planned movement.`,
      severity: "MEDIUM",
    },
    HIGH_HOP_MOVEMENT: {
      eventType: "HIGH_HOP_LAYERING",
      title: "Deep layering through many wallets",
      description: `Funds were routed through a long chain of intermediate wallets to create distance from the original source. This layering makes manual tracing extremely difficult.`,
      severity: "MEDIUM",
    },
    ILLICIT_INTERACTION: {
      eventType: "MIXER_INTERACTION", // Use mixer as fallback event type
      title: "Interaction with flagged entity",
      description: `Funds interacted with an address that has been flagged by law enforcement as connected to illegal activity.`,
      severity: "CRITICAL",
    },
    CIRCULAR_FLOW: null,
    STRUCTURING: null,
  };

  const mapped = typeMap[pattern.patternType];
  if (!mapped) return null;

  return {
    ...base,
    eventType: mapped.eventType,
    title: mapped.title,
    description: mapped.description,
    severity: mapped.severity,
  };
}
