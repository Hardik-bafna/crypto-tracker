import { z } from "zod";

export const SuspiciousPatternTypeEnum = z.enum([
  "FAN_OUT",
  "FAN_IN",
  "RAPID_MOVEMENT",
  "PEEL_CHAIN",
  "HIGH_HOP_MOVEMENT",
  "MIXER_INTERACTION",
  "BRIDGE_INTERACTION",
  "ILLICIT_INTERACTION",
  "CIRCULAR_FLOW",
  "STRUCTURING",
]);
export type SuspiciousPatternType = z.infer<typeof SuspiciousPatternTypeEnum>;

export const EvidenceSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type EvidenceSeverity = z.infer<typeof EvidenceSeverityEnum>;

export const EvidenceSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  severity: EvidenceSeverityEnum,
  source: z.string().optional(),
  timestamp: z.coerce.date(),
  transactionHashes: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const PatternDetectionResultSchema = z.object({
  ruleId: z.string(),
  patternType: SuspiciousPatternTypeEnum,
  title: z.string(),
  description: z.string(),
  severity: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema),
  affectedAddresses: z.array(z.string()),
  affectedTxHashes: z.array(z.string()),
  metrics: z.record(z.unknown()).optional(),
});
export type PatternDetectionResult = z.infer<typeof PatternDetectionResultSchema>;

export interface PatternRuleConfig {
  fanOutThreshold?: number;
  fanOutTimeWindowSeconds?: number;
  fanInThreshold?: number;
  fanInTimeWindowSeconds?: number;
  rapidMovementMaxIntervalSeconds?: number;
  peelChainMinHops?: number;
  peelChainRatioThreshold?: number;
  highHopThreshold?: number;
}
