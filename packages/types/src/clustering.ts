import { z } from "zod";

export const ClusteringSignalTypeEnum = z.enum([
  "COMMON_INPUT_OWNERSHIP",
  "CHANGE_ADDRESS_HEURISTIC",
  "TEMPORAL_PROXIMITY",
  "REPEATED_INTERACTION",
  "IDENTICAL_FEES_OR_NONCES",
  "SWEEP_CONSOLIDATION",
]);
export type ClusteringSignalType = z.infer<typeof ClusteringSignalTypeEnum>;

export const ClusteringSignalSchema = z.object({
  type: ClusteringSignalTypeEnum,
  description: stringDescription => z.string().parse(stringDescription),
  confidence: z.number().min(0).max(1),
  txHashes: z.array(z.string()).default([]),
});

export const WalletClusterSchema = z.object({
  clusterId: z.string(),
  name: z.string().optional(),
  members: z.array(z.string()),
  primaryAddress: z.string().optional(),
  confidence: z.number().min(0).max(1),
  signals: z.array(z.string()),
  detailedSignals: z.array(z.object({
    type: z.string(),
    description: z.string(),
    confidence: z.number(),
    txHashes: z.array(z.string()).optional(),
  })).optional(),
  chain: z.string(),
  totalTxCount: z.number().optional(),
  createdAt: z.coerce.date(),
  tags: z.array(z.string()).optional(),
});
export type WalletCluster = z.infer<typeof WalletClusterSchema>;
