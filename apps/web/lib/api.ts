import {
  Investigation,
  CreateInvestigationRequest,
  InvestigationReport,
  AIQueryResponse,
  TimelineEvent,
  GraphData,
  PatternDetectionResult,
  GraphNode,
} from "@crypto-tracer/types";
import { BlockchainAdapterFactory, SYNTHETIC_DEMO_CASES } from "@crypto-tracer/blockchain";
import { GraphBuilder } from "@crypto-tracer/graph";
import { EntityDatabase, AttributionEngine } from "@crypto-tracer/entities";
import { PatternEngine } from "@crypto-tracer/analysis";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { RiskEngine } from "@crypto-tracer/risk";
import { ReportGenerator, ToolDispatcher, AIInvestigator } from "@crypto-tracer/ai";

class LocalInvestigationStore {
  private investigations: Map<string, Investigation> = new Map();
  private entityDb = new EntityDatabase();
  private patternEngine = new PatternEngine(this.entityDb);
  private clusterEngine = new ClusterEngine();
  private riskEngine = new RiskEngine();
  private attributionEngine = new AttributionEngine(this.entityDb);

  async create(req: CreateInvestigationRequest): Promise<Investigation> {
    const id = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const detected = BlockchainAdapterFactory.detectChain(req.target);
    const chain = req.chain || (detected.chain !== "unknown" ? detected.chain : "ethereum");
    const targetType = detected.type !== "unknown" ? detected.type : "address";
    const adapter = BlockchainAdapterFactory.getAdapter(chain, req.mode as "live" | "demo");

    // Validate formatting before querying
    const isValidAddress = adapter.validateAddress ? adapter.validateAddress(req.target) : false;
    const isValidTx = adapter.validateTxHash ? adapter.validateTxHash(req.target) : false;
    
    if (req.mode !== "demo" && chain !== "synthetic" && !isValidAddress && !isValidTx) {
      throw new Error(`Invalid format for ${chain.toUpperCase()}. Please enter a proper wallet address or transaction hash.`);
    }

    const maxHops = req.maxHops || 5;
    const direction = req.direction || "forward";

    // Build Graph
    const graph = await GraphBuilder.ingestAndBuild(adapter, req.target, maxHops, direction);

    if (graph.getEdgeCount() === 0) {
      throw new Error(`Invalid address or no transactions found on ${chain.toUpperCase()} for ${req.target}`);
    }

    // Entity Labels
    for (const node of graph.getAllNodes()) {
      const entityMatch = this.entityDb.getEntityByAddress(node.address);
      if (entityMatch) {
        node.entityId = entityMatch.entity.id;
        node.entityName = entityMatch.entity.name;
        node.entityType = entityMatch.entity.type;
        node.tags = [...(node.tags || []), entityMatch.entity.type, entityMatch.mapping.confidence];
        node.type = entityMatch.entity.type === "MIXER" || entityMatch.entity.type === "BRIDGE" ? "contract" : "entity";
      }
    }

    // Pattern Detection
    const { patterns, evidence } = this.patternEngine.analyze(graph);

    // Wallet Clustering
    const allTxs = await adapter.getAddressTransactions(req.target, { limit: 50 });
    const clusters = this.clusterEngine.clusterWallets(allTxs, chain);

    // Attributions
    const { observedFacts, inferences, attributions } = this.attributionEngine.generateAttributions(
      graph.getAllNodes().map((n) => n.address),
      allTxs,
      graph.getAllEdges()
    );

    // Risk Assessment
    const risk = this.riskEngine.evaluate({
      target: req.target,
      targetType,
      patterns,
      evidence,
      nodes: graph.getAllNodes(),
      clusters,
    });

    const totalVolume = graph
      .getAllEdges()
      .reduce((sum, e) => sum + (parseFloat(e.formattedAmount || e.amount) || 0), 0)
      .toFixed(2);

    const investigation: Investigation = {
      id,
      title: req.title || `Investigation: ${req.target.slice(0, 8)}... (${chain.toUpperCase()})`,
      description: req.description || `Forensic transaction tracing for ${targetType} ${req.target}`,
      target: req.target,
      targetType,
      chain,
      direction,
      maxHops,
      status: "completed",
      caseNumber: req.caseNumber || `CASE-${Date.now().toString().slice(-6)}`,
      investigatorName: req.investigatorName || "Task Force Special Investigator",
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalNodes: graph.getNodeCount(),
        totalEdges: graph.getEdgeCount(),
        totalVolume,
        riskScore: risk.overallScore,
        detectedPatternsCount: patterns.length,
        identifiedEntitiesCount: graph.getAllNodes().filter((n) => !!n.entityType).length,
        evidenceCount: evidence.length,
      },
      graph: graph.toJSON(),
      risk,
      patterns,
      entities: this.entityDb.getAllEntities(),
      clusters,
      evidence,
      attributions,
      timeline: generateTimelineFromData(graph.toJSON(), patterns),
    };

    this.investigations.set(id, investigation);
    return investigation;
  }

  get(id: string): Investigation | undefined {
    return this.investigations.get(id);
  }

  getDispatcher(): ToolDispatcher {
    return new ToolDispatcher(this.entityDb, this.patternEngine, this.clusterEngine, this.riskEngine);
  }
}

const localStore = new LocalInvestigationStore();
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchDemoCases() {
  try {
    const res = await fetch(`${API_BASE}/api/demo/cases`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return SYNTHETIC_DEMO_CASES;
}

export async function createInvestigation(req: CreateInvestigationRequest): Promise<Investigation> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return json.data;
    } else {
      throw new Error(json.error || "Failed to create investigation");
    }
  } catch (err: any) {
    // If it's our own thrown error from a 400/500 response, re-throw it.
    // Otherwise, if it's a TypeError (Network Error from fetch failing), fall back to localStore.
    if (err.message && err.message !== "Failed to fetch" && !err.message.includes("NetworkError") && err.name !== "TypeError") {
      throw err;
    }
    // Fallback to local store
    return localStore.create(req);
  }
}

export async function fetchInvestigation(id: string): Promise<Investigation | null> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return localStore.get(id) || null;
}

export async function fetchInvestigationReport(id: string): Promise<InvestigationReport | null> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations/${id}/report`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  const inv = localStore.get(id);
  return inv ? ReportGenerator.generateReport(inv) : null;
}

export async function queryAI(investigationId: string, query: string): Promise<AIQueryResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investigationId, query }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}

  const inv = localStore.get(investigationId);
  const investigator = new AIInvestigator(localStore.getDispatcher());
  return investigator.processQuery({ investigationId, query }, inv);
}

// --- Timeline generation for local fallback ---

function generateTimelineFromData(
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

  const entityName = (addr: string): string | undefined =>
    nodeMap.get(addr.toLowerCase())?.entityName;

  const shortAddr = (addr: string): string =>
    addr.length <= 12 ? addr : `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const walletLabel = (addr: string): string => entityName(addr) || shortAddr(addr);

  const amounts = edges
    .map((e) => parseFloat(e.formattedAmount || e.amount) || 0)
    .filter((a) => a > 0);
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const medianAmount =
    sortedAmounts.length > 0 ? sortedAmounts[Math.floor(sortedAmounts.length / 2)] : 0;
  const largeThreshold = medianAmount * 2.5;

  const coveredEdgeIds = new Set<string>();

  type PatternEventMap = {
    eventType: TimelineEvent["eventType"];
    title: string;
    description: string;
    severity: TimelineEvent["severity"];
  };

  const patternMap: Record<string, PatternEventMap | null> = {
    MIXER_INTERACTION: { eventType: "MIXER_INTERACTION", title: "Privacy mixer interaction detected", description: "Funds were sent through a privacy mixer designed to obscure the money trail.", severity: "CRITICAL" },
    BRIDGE_INTERACTION: { eventType: "BRIDGE_INTERACTION", title: "Cross-chain bridge transfer", description: "Funds were moved to a different blockchain network using a bridge service.", severity: "HIGH" },
    PEEL_CHAIN: { eventType: "PEEL_CHAIN", title: "Peel chain structure detected", description: "Funds passed through a series of wallets, each skimming a small amount while forwarding the rest.", severity: "HIGH" },
    FAN_OUT: { eventType: "FAN_OUT", title: "Funds split across multiple wallets", description: "A single wallet distributed funds across multiple addresses to avoid detection.", severity: "HIGH" },
    FAN_IN: { eventType: "FAN_IN", title: "Funds collected from multiple wallets", description: "Multiple wallets sent funds into a single address, consolidating previously split amounts.", severity: "HIGH" },
    RAPID_MOVEMENT: { eventType: "RAPID_ACTIVITY", title: "Rapid transaction activity", description: "Funds moved through multiple wallets in quick succession, suggesting automated movement.", severity: "MEDIUM" },
    HIGH_HOP_MOVEMENT: { eventType: "HIGH_HOP_LAYERING", title: "Deep layering through many wallets", description: "Funds were routed through a long chain of intermediate wallets to obscure the origin.", severity: "MEDIUM" },
    ILLICIT_INTERACTION: { eventType: "MIXER_INTERACTION", title: "Interaction with flagged entity", description: "Funds interacted with an address flagged by law enforcement.", severity: "CRITICAL" },
  };

  for (const pattern of patterns) {
    const patternEdges = edges.filter(
      (e) =>
        pattern.affectedTxHashes.includes(e.txHash) ||
        (pattern.affectedAddresses.includes(e.source) && pattern.affectedAddresses.includes(e.target))
    );
    const timestamp = patternEdges.length > 0 ? patternEdges[0].timestamp : (pattern.evidence[0]?.timestamp || new Date());
    const relatedEdgeIds = patternEdges.map((e) => e.id);
    const relatedNodeIds = [...new Set(patternEdges.flatMap((e) => [e.source.toLowerCase(), e.target.toLowerCase()]))];
    patternEdges.forEach((e) => coveredEdgeIds.add(e.id));

    const mapped = patternMap[pattern.patternType];
    if (mapped) {
      const firstEdge = patternEdges[0];
      events.push({
        id: `tl-pattern-${pattern.ruleId}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp,
        eventType: mapped.eventType,
        title: mapped.title,
        description: mapped.description,
        sourceAddress: firstEdge?.source,
        sourceEntity: firstEdge ? entityName(firstEdge.source) : undefined,
        destinationAddress: firstEdge?.target,
        destinationEntity: firstEdge ? entityName(firstEdge.target) : undefined,
        txHash: firstEdge?.txHash,
        amount: firstEdge?.formattedAmount || firstEdge?.amount,
        asset: firstEdge?.asset,
        patternType: pattern.patternType,
        severity: mapped.severity,
        relatedNodeIds,
        relatedEdgeIds,
      });
    }
  }

  if (edges.length > 0) {
    const first = edges[0];
    events.push({
      id: `tl-initial-${first.id}`,
      timestamp: first.timestamp,
      eventType: "INITIAL_FUNDS",
      title: "First recorded transaction",
      description: `${walletLabel(first.source)} sent ${first.formattedAmount || first.amount} to ${walletLabel(first.target)}.`,
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

  const exchangeNodes = graph.nodes.filter((n) => n.entityType === "EXCHANGE");
  for (const exNode of exchangeNodes) {
    const addr = exNode.address.toLowerCase();
    const incomingEdges = edges.filter((e) => e.target.toLowerCase() === addr && !coveredEdgeIds.has(e.id));
    if (incomingEdges.length > 0) {
      const edge = incomingEdges[0];
      events.push({
        id: `tl-exchange-${edge.id}`,
        timestamp: edge.timestamp,
        eventType: "EXCHANGE_INTERACTION",
        title: `Funds reached ${exNode.entityName || "an exchange"}`,
        description: `${walletLabel(edge.source)} transferred ${edge.formattedAmount || edge.amount} to ${exNode.entityName || "a regulated exchange"}, a potential cash-out point.`,
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
          description: `${walletLabel(edge.source)} sent ${edge.formattedAmount || edge.amount} to ${walletLabel(edge.target)}, significantly above the typical amount.`,
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

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return events;
}
