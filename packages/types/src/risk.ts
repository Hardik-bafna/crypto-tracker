import { z } from "zod";

export const RiskLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const RiskFactorSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  scoreDelta: z.number(),
  maxPossible: z.number(),
  description: z.string(),
  severity: RiskLevelEnum,
  evidenceIds: z.array(z.string()).default([]),
});
export type RiskFactor = z.infer<typeof RiskFactorSchema>;

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
