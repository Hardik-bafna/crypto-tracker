import { z } from "zod";
import { GraphDataSchema } from "./graph";
import { RiskAssessmentSchema } from "./risk";
import { EvidenceSchema, PatternDetectionResultSchema } from "./analysis";
import { EntitySchema, AttributionItemSchema } from "./entities";
import { WalletClusterSchema } from "./clustering";
import { TimelineEventSchema } from "./timeline";

export const InvestigationStatusEnum = z.enum(["queued", "processing", "completed", "failed"]);
export type InvestigationStatus = z.infer<typeof InvestigationStatusEnum>;

export const InvestigationStatsSchema = z.object({
  totalNodes: z.number().default(0),
  totalEdges: z.number().default(0),
  totalVolume: z.string().default("0"),
  riskScore: z.number().default(0),
  detectedPatternsCount: z.number().default(0),
  identifiedEntitiesCount: z.number().default(0),
  evidenceCount: z.number().default(0),
});
export type InvestigationStats = z.infer<typeof InvestigationStatsSchema>;

export const InvestigationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  target: z.string(),
  targetType: z.enum(["address", "txHash"]),
  chain: z.string(),
  direction: z.enum(["forward", "backward", "both"]).default("forward"),
  maxHops: z.number().min(1).max(20).default(5),
  status: InvestigationStatusEnum.default("completed"),
  caseNumber: z.string().optional(),
  investigatorName: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  stats: InvestigationStatsSchema.optional(),
  graph: GraphDataSchema.optional(),
  risk: RiskAssessmentSchema.optional(),
  patterns: z.array(PatternDetectionResultSchema).optional(),
  entities: z.array(EntitySchema).optional(),
  clusters: z.array(WalletClusterSchema).optional(),
  evidence: z.array(EvidenceSchema).optional(),
  attributions: z.array(AttributionItemSchema).optional(),
  timeline: z.array(TimelineEventSchema).optional(),
});
export type Investigation = z.infer<typeof InvestigationSchema>;

export const CreateInvestigationRequestSchema = z.object({
  target: z.string().min(1, "Target address or transaction hash is required"),
  chain: z.string().default("ethereum"),
  mode: z.enum(["live", "demo"]).default("live"),
  direction: z.enum(["forward", "backward", "both"]).default("forward"),
  maxHops: z.number().min(1).max(20).default(6),
  title: z.string().optional(),
  description: z.string().optional(),
  caseNumber: z.string().optional(),
  investigatorName: z.string().optional(),
  minTransferValue: z.string().optional(),
  asset: z.string().optional(),
});
export type CreateInvestigationRequest = z.infer<typeof CreateInvestigationRequestSchema>;

export const SubpoenaRecommendationSchema = z.object({
  entityName: z.string(),
  entityType: z.string(),
  address: z.string(),
  jurisdiction: z.string().optional(),
  recommendedAction: z.string(),
  targetInfoToRequest: z.array(z.string()),
  relatedTxHashes: z.array(z.string()),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});
export type SubpoenaRecommendation = z.infer<typeof SubpoenaRecommendationSchema>;

export const InvestigationReportSchema = z.object({
  id: z.string(),
  investigationId: z.string(),
  title: z.string(),
  caseNumber: z.string(),
  target: z.string(),
  chain: z.string(),
  generatedAt: z.coerce.date(),
  investigatorName: z.string(),
  executiveSummary: z.string(),
  observedFacts: z.array(z.string()),
  inferences: z.array(z.string()),
  attributions: z.array(AttributionItemSchema),
  riskAssessment: RiskAssessmentSchema,
  patterns: z.array(PatternDetectionResultSchema),
  evidenceLedger: z.array(EvidenceSchema),
  flowPaths: z.array(z.object({
    source: z.string(),
    destination: z.string(),
    hops: z.number(),
    volume: z.string(),
    asset: z.string(),
    entitiesReached: z.array(z.string()),
  })),
  subpoenaRecommendations: z.array(SubpoenaRecommendationSchema),
});
export type InvestigationReport = z.infer<typeof InvestigationReportSchema>;
