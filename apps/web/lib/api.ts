import {
  Investigation,
  CreateInvestigationRequest,
  InvestigationReport,
  AIQueryResponse,
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
    const adapter = BlockchainAdapterFactory.getAdapter(chain);

    const maxHops = req.maxHops || 5;
    const direction = req.direction || "forward";

    // Build Graph
    const graph = await GraphBuilder.ingestAndBuild(adapter, req.target, maxHops, direction);

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
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return localStore.create(req);
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
