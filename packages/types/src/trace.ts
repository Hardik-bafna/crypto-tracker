import { z } from "zod";
import { GraphNodeSchema, GraphEdgeSchema } from "./graph";
import { SuspiciousPatternTypeEnum } from "./analysis";

export const TracePathOptionsSchema = z.object({
  startAddress: z.string(),
  destinationAddress: z.string().optional(),
  destinationEntityType: z.string().optional(),
  maxHops: z.number().min(1).max(10).default(6),
  minAmount: z.number().min(0).optional(),
});
export type TracePathOptions = z.infer<typeof TracePathOptionsSchema>;

export const TracePathDetailSchema = z.object({
  id: z.string(),
  pathIndex: z.number(),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  hopCount: z.number(),
  totalVolume: z.number(),
  asset: z.string(),
  timeSpanSeconds: z.number(),
  knownEntities: z.array(z.string()),
  suspiciousIndicators: z.array(z.string()),
});
export type TracePathDetail = z.infer<typeof TracePathDetailSchema>;
