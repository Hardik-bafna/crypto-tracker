import { z } from "zod";

export type NodeType = "address" | "entity" | "contract" | "cluster";

export const GraphNodeSchema = z.object({
  id: z.string(),
  address: z.string(),
  label: z.string(),
  type: z.enum(["address", "entity", "contract", "cluster"]).default("address"),
  chain: z.string(),
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  entityType: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  clusterId: z.string().optional(),
  balance: z.string().optional(),
  formattedBalance: z.string().optional(),
  txCount: z.number().optional(),
  firstSeen: z.coerce.date().optional(),
  lastSeen: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  isTarget: z.boolean().optional(),
  isSuspect: z.boolean().optional(),
  hopLevel: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  txHash: z.string(),
  asset: z.string(),
  amount: z.string(),
  formattedAmount: z.string(),
  valueUsd: z.number().optional(),
  timestamp: z.coerce.date(),
  chain: z.string(),
  fee: z.string().optional(),
  isTokenTransfer: z.boolean().optional(),
  tokenSymbol: z.string().optional(),
  isContractCall: z.boolean().optional(),
  confidence: z.number().min(0).max(1).default(1.0),
  isCrossChain: z.boolean().optional(),
  bridgeName: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type GraphData = z.infer<typeof GraphDataSchema>;

export interface GraphFilterOptions {
  minAmount?: string;
  maxAmount?: string;
  asset?: string;
  chain?: string;
  startTime?: Date;
  endTime?: Date;
  entityTypes?: string[];
  hideSmallTransfers?: boolean;
}

export interface TraversalOptions {
  direction: "forward" | "backward" | "both";
  maxHops: number;
  maxNodes?: number;
  maxTransactions?: number;
  minAmount?: string;
  asset?: string;
  startTime?: Date;
  endTime?: Date;
  targetAddress?: string;
}

export interface PathResult {
  nodes: string[];
  edges: GraphEdge[];
  totalAmount: string;
  asset: string;
  hopCount: number;
  timeSpanSeconds: number;
  hasMixer: boolean;
  hasBridge: boolean;
  destinationEntity?: string;
}
