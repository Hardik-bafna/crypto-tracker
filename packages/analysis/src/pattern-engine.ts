import { TransactionGraph } from "@crypto-tracer/graph";
import { EntityDatabase } from "@crypto-tracer/entities";
import {
  PatternDetectionResult,
  Evidence,
  PatternRuleConfig,
} from "@crypto-tracer/types";
import { detectFanOut } from "./rules/fan-out";
import { detectFanIn } from "./rules/fan-in";
import { detectPeelChain } from "./rules/peel-chain";
import { detectRapidMovement } from "./rules/rapid-movement";
import { detectHighHop } from "./rules/high-hop";
import { detectKnownServiceInteractions } from "./rules/known-service";
import { detectCrossChain } from "./rules/cross-chain";

export class PatternEngine {
  constructor(
    private entityDb: EntityDatabase,
    private config: PatternRuleConfig = {}
  ) {}

  analyze(graph: TransactionGraph): {
    patterns: PatternDetectionResult[];
    evidence: Evidence[];
  } {
    const allPatterns: PatternDetectionResult[] = [];

    // 1. Fan-out
    allPatterns.push(
      ...detectFanOut(graph, {
        threshold: this.config.fanOutThreshold,
        windowSeconds: this.config.fanOutTimeWindowSeconds,
      })
    );

    // 2. Fan-in
    allPatterns.push(
      ...detectFanIn(graph, {
        threshold: this.config.fanInThreshold,
        windowSeconds: this.config.fanInTimeWindowSeconds,
      })
    );

    // 3. Peel Chain
    allPatterns.push(
      ...detectPeelChain(graph, {
        minHops: this.config.peelChainMinHops,
        peelRatioThreshold: this.config.peelChainRatioThreshold,
      })
    );

    // 4. Rapid Movement
    allPatterns.push(
      ...detectRapidMovement(graph, {
        maxIntervalSeconds: this.config.rapidMovementMaxIntervalSeconds,
      })
    );

    // 5. High-hop Layering
    allPatterns.push(
      ...detectHighHop(graph, {
        threshold: this.config.highHopThreshold,
      })
    );

    // 6. Known Services (Mixers, Illicit targets)
    allPatterns.push(...detectKnownServiceInteractions(graph, this.entityDb));

    // 7. Cross-chain Bridges
    allPatterns.push(...detectCrossChain(graph, this.entityDb));

    // Extract all evidence
    const evidenceList: Evidence[] = [];
    const seenEvidence = new Set<string>();

    for (const pattern of allPatterns) {
      for (const ev of pattern.evidence) {
        if (!seenEvidence.has(ev.id)) {
          seenEvidence.add(ev.id);
          evidenceList.push(ev);
        }
      }
    }

    return {
      patterns: allPatterns,
      evidence: evidenceList,
    };
  }
}
