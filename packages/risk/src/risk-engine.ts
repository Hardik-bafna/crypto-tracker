import {
  RiskAssessment,
  RiskFactor,
  RiskLevel,
  RiskEngineConfig,
  ConfidenceAssessment,
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
    targetType?: "address" | "transaction" | "txHash" | "cluster" | "investigation";
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

    // Compute confidence assessment
    const confidence = this.evaluateConfidence(params);

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
      confidence,
    };
  }

  /**
   * Evaluates the confidence (reliability) of the investigation based on
   * evidence quality, entity coverage, and data completeness.
   * This is independent from the risk score — risk measures severity of
   * indicators while confidence measures how much we can trust the results.
   */
  private evaluateConfidence(params: {
    patterns: PatternDetectionResult[];
    evidence: Evidence[];
    nodes?: GraphNode[];
    clusters?: WalletCluster[];
  }): ConfidenceAssessment {
    const strengths: string[] = [];
    const limitations: string[] = [];
    let confidencePoints = 0;
    const maxPoints = 100;

    const nodes = params.nodes || [];
    const totalNodes = nodes.length;

    // --- 1. Entity attribution coverage (0-25 pts) ---
    const identifiedNodes = nodes.filter((n) => !!n.entityType).length;
    const attributionRatio = totalNodes > 0 ? identifiedNodes / totalNodes : 0;

    if (attributionRatio >= 0.4) {
      confidencePoints += 25;
      strengths.push("Multiple wallets identified as known entities");
    } else if (attributionRatio >= 0.2) {
      confidencePoints += 15;
      strengths.push("Some wallets linked to known entities");
      limitations.push("Many wallet owners remain unidentified");
    } else if (identifiedNodes > 0) {
      confidencePoints += 8;
      limitations.push("Most wallet owners remain unidentified");
    } else {
      limitations.push("No wallet owners could be identified");
    }

    // --- 2. Pattern detection confidence (0-25 pts) ---
    if (params.patterns.length > 0) {
      const avgPatternConfidence =
        params.patterns.reduce((sum, p) => sum + p.confidence, 0) / params.patterns.length;

      if (avgPatternConfidence >= 0.85) {
        confidencePoints += 25;
        strengths.push("Detected patterns have high certainty");
      } else if (avgPatternConfidence >= 0.6) {
        confidencePoints += 15;
        strengths.push("Detected patterns have moderate certainty");
      } else {
        confidencePoints += 8;
        limitations.push("Detected patterns have lower certainty");
      }
    } else {
      confidencePoints += 5;
      limitations.push("No suspicious patterns were detected to evaluate");
    }

    // --- 3. Evidence density (0-20 pts) ---
    const evidenceCount = params.evidence.length;
    if (evidenceCount >= 5) {
      confidencePoints += 20;
      strengths.push(`${evidenceCount} pieces of supporting evidence collected`);
    } else if (evidenceCount >= 2) {
      confidencePoints += 12;
      strengths.push(`${evidenceCount} pieces of supporting evidence found`);
    } else if (evidenceCount >= 1) {
      confidencePoints += 6;
      limitations.push("Limited supporting evidence available");
    } else {
      limitations.push("No supporting evidence was collected");
    }

    // --- 4. Cross-chain completeness (0-15 pts) ---
    const bridgePatterns = params.patterns.filter((p) => p.patternType === "BRIDGE_INTERACTION");
    const hasCrossChainEdges = nodes.some((n) => n.tags?.includes("BRIDGE"));

    if (bridgePatterns.length === 0 && !hasCrossChainEdges) {
      // No cross-chain activity, so no gap
      confidencePoints += 15;
      strengths.push("All activity observed on a single blockchain");
    } else if (bridgePatterns.length > 0) {
      confidencePoints += 8;
      limitations.push("Funds moved across blockchains — destination chain may not be fully traced");
    } else {
      confidencePoints += 5;
      limitations.push("Bridge interactions detected but cross-chain tracing is incomplete");
    }

    // --- 5. Cluster coverage (0-15 pts) ---
    const clusters = params.clusters || [];
    const clusteredAddresses = new Set(clusters.flatMap((c) => c.addresses));
    const clusterRatio = totalNodes > 0 ? clusteredAddresses.size / totalNodes : 0;

    if (clusterRatio >= 0.3) {
      confidencePoints += 15;
      strengths.push("Wallet clustering identified related addresses");
    } else if (clusters.length > 0) {
      confidencePoints += 8;
      strengths.push("Some wallet clusters were identified");
      limitations.push("Many addresses could not be grouped into clusters");
    } else {
      confidencePoints += 3;
      limitations.push("Wallet ownership grouping could not be determined");
    }

    // --- Check for exchange endpoints ---
    const exchangeNodes = nodes.filter((n) => n.entityType === "EXCHANGE");
    if (exchangeNodes.length > 0) {
      strengths.push(
        `Cash-out endpoint identified at ${exchangeNodes.map((n) => n.entityName || "an exchange").join(", ")}`
      );
    } else {
      limitations.push("No cash-out exchange endpoint was identified");
    }

    // --- Check for mixer confirmation ---
    const mixerPatterns = params.patterns.filter((p) => p.patternType === "MIXER_INTERACTION");
    if (mixerPatterns.length > 0) {
      strengths.push("Mixer/privacy pool interaction confirmed");
    }

    // Normalize
    const confidenceScore = Math.min(100, Math.max(0, Math.round(confidencePoints)));

    let confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    if (confidenceScore >= 80) {
      confidenceLevel = "VERIFIED";
    } else if (confidenceScore >= 60) {
      confidenceLevel = "HIGH";
    } else if (confidenceScore >= 35) {
      confidenceLevel = "MEDIUM";
    } else {
      confidenceLevel = "LOW";
    }

    return {
      confidenceScore,
      confidenceLevel,
      strengths,
      limitations,
    };
  }
}
