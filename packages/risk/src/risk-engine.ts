import {
  RiskAssessment,
  RiskFactor,
  RiskLevel,
  RiskEngineConfig,
  PatternDetectionResult,
  Evidence,
  GraphNode,
  WalletCluster,
} from "@crypto-tracer/types";

export class RiskEngine {
  private config: Required<RiskEngineConfig>;

  constructor(customConfig: RiskEngineConfig = {}) {
    this.config = {
      mixerInteractionWeight: customConfig.mixerInteractionWeight ?? 30,
      knownIllicitWeight: customConfig.knownIllicitWeight ?? 35,
      scamInteractionWeight: customConfig.scamInteractionWeight ?? 25,
      peelChainWeight: customConfig.peelChainWeight ?? 15,
      rapidMovementWeight: customConfig.rapidMovementWeight ?? 10,
      fanOutWeight: customConfig.fanOutWeight ?? 12,
      fanInWeight: customConfig.fanInWeight ?? 10,
      crossChainBridgeWeight: customConfig.crossChainBridgeWeight ?? 12,
      highHopWeight: customConfig.highHopWeight ?? 10,
      clusterAssociationWeight: customConfig.clusterAssociationWeight ?? 15,
    };
  }

  evaluate(params: {
    target: string;
    targetType?: "address" | "transaction" | "cluster" | "investigation";
    patterns: PatternDetectionResult[];
    evidence: Evidence[];
    nodes?: GraphNode[];
    clusters?: WalletCluster[];
  }): RiskAssessment {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    const recommendations: string[] = [];
    const target = params.target;
    const targetType = params.targetType || "investigation";

    // 1. Evaluate Mixer Interactions
    const mixerPatterns = params.patterns.filter((p) => p.patternType === "MIXER_INTERACTION");
    if (mixerPatterns.length > 0) {
      const mixerEvIds = mixerPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(35, this.config.mixerInteractionWeight * mixerPatterns.length);
      totalScore += delta;
      factors.push({
        id: "FACTOR_MIXER",
        name: "Mixer / Privacy Pool Interaction",
        category: "Anonymization Protocols",
        scoreDelta: delta,
        maxPossible: 35,
        description: `Direct deposit or withdrawal identified with ${mixerPatterns.length} mixer/privacy pool contract(s). Intentional provenance obfuscation.`,
        severity: "CRITICAL",
        evidenceIds: mixerEvIds,
      });
      recommendations.push(
        "Request withdrawal relayer metadata and deposit timing correlations for identified mixer pools."
      );
    }

    // 2. Evaluate Known Illicit Entities / Narcotics Marketplaces
    const illicitPatterns = params.patterns.filter((p) => p.patternType === "ILLICIT_INTERACTION");
    if (illicitPatterns.length > 0) {
      const illicitEvIds = illicitPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(40, this.config.knownIllicitWeight * illicitPatterns.length);
      totalScore += delta;
      factors.push({
        id: "FACTOR_ILLICIT",
        name: "Law Enforcement Flagged / Narcotics Association",
        category: "Criminal Intelligence",
        scoreDelta: delta,
        maxPossible: 40,
        description: `Direct interaction with ${illicitPatterns.length} confirmed law-enforcement target(s) or darknet narcotics distribution addresses.`,
        severity: "CRITICAL",
        evidenceIds: illicitEvIds,
      });
      recommendations.push(
        "Issue formal 18 U.S.C. preservation request and prepare search warrant for linked accounts."
      );
    }

    // 3. Evaluate Peel Chain Structure
    const peelPatterns = params.patterns.filter((p) => p.patternType === "PEEL_CHAIN");
    if (peelPatterns.length > 0) {
      const peelEvIds = peelPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(20, this.config.peelChainWeight * peelPatterns.length);
      totalScore += delta;
      factors.push({
        id: "FACTOR_PEEL_CHAIN",
        name: "Peel Chain Layering",
        category: "Transaction Structuring",
        scoreDelta: delta,
        maxPossible: 20,
        description: `Detected ${peelPatterns.length} sequential peel chain structure(s) peeling off incremental fees while forwarding bulk funds.`,
        severity: "HIGH",
        evidenceIds: peelEvIds,
      });
      recommendations.push(
        "Monitor peeled change outputs for eventual consolidation or unhosted ATM cashouts."
      );
    }

    // 4. Evaluate Rapid Movement Velocity
    const rapidPatterns = params.patterns.filter((p) => p.patternType === "RAPID_MOVEMENT");
    if (rapidPatterns.length > 0) {
      const rapidEvIds = rapidPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(15, this.config.rapidMovementWeight);
      totalScore += delta;
      factors.push({
        id: "FACTOR_RAPID_MOVEMENT",
        name: "High Velocity Relay",
        category: "Velocity",
        scoreDelta: delta,
        maxPossible: 15,
        description: "Funds moved through intermediary addresses with minimal holding latency (< 30 minutes per hop).",
        severity: "MEDIUM",
        evidenceIds: rapidEvIds,
      });
    }

    // 5. Evaluate Cross-Chain Bridge Evasion
    const bridgePatterns = params.patterns.filter((p) => p.patternType === "BRIDGE_INTERACTION");
    if (bridgePatterns.length > 0) {
      const bridgeEvIds = bridgePatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(15, this.config.crossChainBridgeWeight);
      totalScore += delta;
      factors.push({
        id: "FACTOR_CROSS_CHAIN",
        name: "Cross-Chain Bridge Routing",
        category: "Chain-Hopping",
        scoreDelta: delta,
        maxPossible: 15,
        description: "Funds routed across bridge protocols to migrate balances to alternative blockchain networks.",
        severity: "HIGH",
        evidenceIds: bridgeEvIds,
      });
      recommendations.push(
        "Serve 2703(d) order or MLAT request to destination chain bridge validator operators."
      );
    }

    // 6. Evaluate High-Hop Movement
    const highHopPatterns = params.patterns.filter((p) => p.patternType === "HIGH_HOP_MOVEMENT");
    if (highHopPatterns.length > 0) {
      const hopEvIds = highHopPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(15, this.config.highHopWeight);
      totalScore += delta;
      factors.push({
        id: "FACTOR_HIGH_HOP",
        name: "Extended Hop Layering",
        category: "Layering",
        scoreDelta: delta,
        maxPossible: 15,
        description: "Funds passed through extended chains of intermediate unhosted wallets to create distance from origin.",
        severity: "MEDIUM",
        evidenceIds: hopEvIds,
      });
    }

    // 7. Evaluate Fan-Out / Fan-In Dispersal
    const fanPatterns = params.patterns.filter((p) => p.patternType === "FAN_OUT" || p.patternType === "FAN_IN");
    if (fanPatterns.length > 0) {
      const fanEvIds = fanPatterns.flatMap((p) => p.evidence.map((e) => e.id));
      const delta = Math.min(15, this.config.fanOutWeight);
      totalScore += delta;
      factors.push({
        id: "FACTOR_FAN_FLOW",
        name: "Dispersal / Aggregation Structuring",
        category: "Structuring",
        scoreDelta: delta,
        maxPossible: 15,
        description: "Rapid fan-out distribution to mule wallets or fan-in consolidation into cashout hubs.",
        severity: "HIGH",
        evidenceIds: fanEvIds,
      });
    }

    // Normalize final score to 0 - 100
    const overallScore = Math.min(100, Math.max(0, totalScore));

    // Determine Risk Level
    let riskLevel: RiskLevel;
    if (overallScore >= 75) {
      riskLevel = "CRITICAL";
    } else if (overallScore >= 50) {
      riskLevel = "HIGH";
    } else if (overallScore >= 25) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    // Build Summary
    const summary =
      overallScore >= 75
        ? `CRITICAL RISK (${overallScore}/100): Investigation target demonstrates high-confidence laundering patterns, including interaction with sanctioned privacy protocols, narcotics distribution entities, and rapid layered structuring.`
        : overallScore >= 50
        ? `HIGH RISK (${overallScore}/100): Significant obfuscation behaviors detected, including peel chains, rapid multi-hop relays, and cross-chain bridging.`
        : overallScore >= 25
        ? `MEDIUM RISK (${overallScore}/100): Moderate risk indicators observed; standard retail or DeFi activity mixed with intermediate hops.`
        : `LOW RISK (${overallScore}/100): No high-risk criminal flags, mixers, or illicit entities detected within analyzed traversal bounds.`;

    if (recommendations.length === 0) {
      recommendations.push("Continue standard transaction monitoring and periodic address re-evaluations.");
    }

    return {
      target,
      targetType,
      overallScore,
      riskLevel,
      factors,
      evidenceList: params.evidence.map((e) => e.id),
      summary,
      calculatedAt: new Date(),
      recommendations,
    };
  }
}
