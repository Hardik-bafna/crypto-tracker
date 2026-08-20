import {
  Investigation,
  CreateInvestigationRequest,
  InvestigationReport,
  RiskAssessment,
  PatternDetectionResult,
  Evidence,
  GraphData,
  WalletCluster,
  AttributionItem,
} from "@crypto-tracer/types";
import { BlockchainAdapterFactory, SYNTHETIC_DEMO_CASES } from "@crypto-tracer/blockchain";
import { GraphBuilder, TransactionGraph, nHopTraversal } from "@crypto-tracer/graph";
import { EntityDatabase, AttributionEngine } from "@crypto-tracer/entities";
import { PatternEngine, AlternativeExplanationEngine } from "@crypto-tracer/analysis";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { RiskEngine } from "@crypto-tracer/risk";
import { ReportGenerator } from "@crypto-tracer/ai";
import { generateTimeline } from "./timeline-generator";

export class InvestigationService {
  private investigations: Map<string, Investigation> = new Map();
  private entityDb: EntityDatabase;
  private patternEngine: PatternEngine;
  private clusterEngine: ClusterEngine;
  private riskEngine: RiskEngine;
  private attributionEngine: AttributionEngine;

  constructor() {
    this.entityDb = new EntityDatabase();
    this.patternEngine = new PatternEngine(this.entityDb);
    this.clusterEngine = new ClusterEngine();
    this.riskEngine = new RiskEngine();
    this.attributionEngine = new AttributionEngine(this.entityDb);

    // Pre-populate with demo cases
    this.initDemoCases();
  }

  private async initDemoCases(): Promise<void> {
    for (const demo of SYNTHETIC_DEMO_CASES) {
      await this.createInvestigation({
        target: demo.suspectAddress,
        chain: demo.chain,
        mode: "demo",
        maxHops: demo.recommendedHops,
        direction: "forward",
        title: demo.name,
        description: demo.description,
        caseNumber: demo.id.toUpperCase(),
        investigatorName: "DEA / High-Intensity Drug Trafficking Area (HIDTA) Unit",
      });
    }
  }

  async createInvestigation(req: CreateInvestigationRequest): Promise<Investigation> {
    const id = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const detected = BlockchainAdapterFactory.detectChain(req.target);
    const chain = req.chain || (detected.chain !== "unknown" ? detected.chain : "ethereum");
    const targetType = detected.type !== "unknown" ? detected.type : "address";
    const adapter = BlockchainAdapterFactory.getAdapter(chain, req.mode);

    // Validate formatting before querying
    const isValidAddress = adapter.validateAddress ? adapter.validateAddress(req.target) : false;
    const isValidTx = adapter.validateTxHash ? adapter.validateTxHash(req.target) : false;
    
    // In synthetic mode, we bypass strict formatting checks since mock addresses might be arbitrary
    if (req.mode !== "demo" && chain !== "synthetic" && !isValidAddress && !isValidTx) {
      throw new Error(`Invalid format for ${chain.toUpperCase()}. Please enter a proper wallet address or transaction hash.`);
    }

    const maxHops = req.maxHops || 5;
    const direction = req.direction || "forward";

    // 1. Ingest transactions & construct Graph
    const graph = await GraphBuilder.ingestAndBuild(adapter, req.target, maxHops, direction);

    console.log(`[Investigation] target=${req.target} chain=${chain} mode=${req.mode} isAddress=${isValidAddress} isTxHash=${isValidTx} edgeCount=${graph.getEdgeCount()} nodeCount=${graph.getNodeCount()}`);

    if (graph.getEdgeCount() === 0) {
      if (isValidTx) {
        throw new Error(`No transaction data found for tx hash ${req.target} on ${chain.toUpperCase()}. The transaction may not yet be indexed, or the network call to the block explorer may have failed.`);
      }
      throw new Error(`No transactions found for address ${req.target} on ${chain.toUpperCase()}. This wallet may have no transaction history.`);
    }

    // Label graph nodes with Entity Intelligence
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

    // 2. Suspicious Pattern Detection
    const { patterns, evidence } = this.patternEngine.analyze(graph);

    // 2b. Alternative Explanation Analysis
    const alternativeExplanations = AlternativeExplanationEngine.analyze(patterns);

    // 3. Wallet Clustering
    const allTxs = await adapter.getAddressTransactions(req.target, { limit: 50 });
    const clusters = this.clusterEngine.clusterWallets(allTxs, chain);

    // 4. Attribution & Legal Inferences
    const { observedFacts, inferences, attributions } = this.attributionEngine.generateAttributions(
      graph.getAllNodes().map((n) => n.address),
      allTxs,
      graph.getAllEdges()
    );

    // 5. Deterministic Risk Assessment
    const risk = this.riskEngine.evaluate({
      target: req.target,
      targetType,
      patterns,
      evidence,
      nodes: graph.getAllNodes(),
      clusters,
    });

    // Calculate summary statistics
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
      alternativeExplanations,
      entities: this.entityDb.getAllEntities(),
      clusters,
      evidence,
      attributions,
      timeline: generateTimeline(graph.toJSON(), patterns),
    };

    this.investigations.set(id, investigation);
    return investigation;
  }

  getInvestigation(id: string): Investigation | undefined {
    return this.investigations.get(id);
  }

  getAllInvestigations(): Investigation[] {
    return Array.from(this.investigations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  traceInvestigation(
    id: string,
    options: { maxHops?: number; direction?: "forward" | "backward" | "both"; minAmount?: string; asset?: string }
  ): GraphData | null {
    const inv = this.investigations.get(id);
    if (!inv || !inv.graph) return null;

    const fullGraph = new TransactionGraph(inv.graph);
    const traversal = nHopTraversal(fullGraph, inv.target, {
      direction: options.direction || inv.direction,
      maxHops: options.maxHops || inv.maxHops,
      minAmount: options.minAmount,
      asset: options.asset,
    });

    return traversal.data;
  }

  getReport(id: string): InvestigationReport | null {
    const inv = this.investigations.get(id);
    if (!inv) return null;
    return ReportGenerator.generateReport(inv);
  }

  getMarkdownReport(id: string): string | null {
    const report = this.getReport(id);
    if (!report) return null;
    return ReportGenerator.formatToMarkdown(report);
  }

  getEntityDatabase(): EntityDatabase {
    return this.entityDb;
  }

  getPatternEngine(): PatternEngine {
    return this.patternEngine;
  }

  getClusterEngine(): ClusterEngine {
    return this.clusterEngine;
  }

  getRiskEngine(): RiskEngine {
    return this.riskEngine;
  }
}
