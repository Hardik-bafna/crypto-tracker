import { z } from "zod";

export const EntityTypeEnum = z.enum([
  "EXCHANGE",
  "MIXER",
  "BRIDGE",
  "MARKETPLACE",
  "GAMBLING",
  "SCAM",
  "KNOWN_ILLICIT",
  "SERVICE",
  "UNKNOWN",
]);
export type EntityType = z.infer<typeof EntityTypeEnum>;

export const EntityConfidenceEnum = z.enum(["LOW", "MEDIUM", "HIGH", "VERIFIED"]);
export type EntityConfidence = z.infer<typeof EntityConfidenceEnum>;

export const EntityAddressMappingSchema = z.object({
  address: z.string(),
  chain: z.string(),
  label: z.string().optional(),
  confidence: EntityConfidenceEnum.default("HIGH"),
  source: z.string(),
  lastVerified: z.coerce.date(),
});
export type EntityAddressMapping = z.infer<typeof EntityAddressMappingSchema>;

export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: EntityTypeEnum,
  category: z.string().optional(),
  description: z.string().optional(),
  addresses: z.array(EntityAddressMappingSchema),
  confidence: EntityConfidenceEnum,
  source: z.string(),
  lastVerified: z.coerce.date(),
  website: z.string().optional(),
  jurisdiction: z.string().optional(),
  isKycCompliant: z.boolean().optional(),
  baseRiskScore: z.number().min(0).max(100).default(0),
});
export type Entity = z.infer<typeof EntitySchema>;

export const AttributionTypeEnum = z.enum(["OBSERVED", "INFERENCE", "ATTRIBUTION"]);
export type AttributionType = z.infer<typeof AttributionTypeEnum>;

export const AttributionItemSchema = z.object({
  address: z.string(),
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  entityType: EntityTypeEnum.optional(),
  attributionType: AttributionTypeEnum,
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  supportingEvidenceIds: z.array(z.string()),
});
export type AttributionItem = z.infer<typeof AttributionItemSchema>;
