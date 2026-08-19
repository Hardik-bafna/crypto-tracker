import { z } from "zod";
import { SuspiciousPatternTypeEnum } from "./analysis";

export const TimelineEventTypeEnum = z.enum([
  "INITIAL_FUNDS",
  "LARGE_TRANSFER",
  "FAN_OUT",
  "FAN_IN",
  "MIXER_INTERACTION",
  "BRIDGE_INTERACTION",
  "RAPID_ACTIVITY",
  "HIGH_HOP_LAYERING",
  "EXCHANGE_INTERACTION",
  "PEEL_CHAIN",
]);
export type TimelineEventType = z.infer<typeof TimelineEventTypeEnum>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  eventType: TimelineEventTypeEnum,
  title: z.string(),
  description: z.string(),
  sourceAddress: z.string().optional(),
  sourceEntity: z.string().optional(),
  destinationAddress: z.string().optional(),
  destinationEntity: z.string().optional(),
  txHash: z.string().optional(),
  amount: z.string().optional(),
  asset: z.string().optional(),
  patternType: SuspiciousPatternTypeEnum.optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  relatedNodeIds: z.array(z.string()).default([]),
  relatedEdgeIds: z.array(z.string()).default([]),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
