import { z } from "zod";

export const RiskLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const EvidenceChainItemSchema = z.object({
  evidenceId: z.string(),
  ruleId: z.string(),
  patternType: z.string(),
  explanation: z.string(),
  transactionHashes: z.array(z.string()).default([]),
  wallets: z.array(z.string()).default([]),
  entityName: z.string().optional(),
  entityType: z.string().optional(),
  timestamp: z.coerce.date(),
  severity: z.string(),
  confidence: z.number().min(0).max(1),
});
export type EvidenceChainItem = z.infer<typeof EvidenceChainItemSchema>;

export const RiskFactorSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  scoreDelta: z.number(),
  maxPossible: z.number(),
  description: z.string(),
  severity: RiskLevelEnum,
  evidenceIds: z.array(z.string()).default([]),
  evidenceChain: z.array(EvidenceChainItemSchema).optional(),
});
export type RiskFactor = z.infer<typeof RiskFactorSchema>;

export const ConfidenceLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "VERIFIED"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;

export const ConfidenceAssessmentSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  confidenceLevel: ConfidenceLevelEnum,
  strengths: z.array(z.string()),
  limitations: z.array(z.string()),
});
export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;

export const RiskAssessmentSchema = z.object({
  target: z.string(),
  targetType: z.enum(["address", "transaction", "txHash", "cluster", "investigation"]),
  overallScore: z.number().min(0).max(100),
  riskLevel: RiskLevelEnum,
  factors: z.array(RiskFactorSchema),
  evidenceList: z.array(z.string()).default([]),
  summary: z.string(),
  calculatedAt: z.coerce.date(),
  recommendations: z.array(z.string()),
  confidence: ConfidenceAssessmentSchema.optional(),
});
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

export interface RiskEngineConfig {
  mixerInteractionWeight?: number;
  knownIllicitWeight?: number;
  scamInteractionWeight?: number;
  peelChainWeight?: number;
  rapidMovementWeight?: number;
  fanOutWeight?: number;
  fanInWeight?: number;
  crossChainBridgeWeight?: number;
  highHopWeight?: number;
  clusterAssociationWeight?: number;
}
