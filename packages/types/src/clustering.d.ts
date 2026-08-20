import { z } from "zod";
export declare const ClusteringSignalTypeEnum: z.ZodEnum<["COMMON_INPUT_OWNERSHIP", "CHANGE_ADDRESS_HEURISTIC", "TEMPORAL_PROXIMITY", "REPEATED_INTERACTION", "IDENTICAL_FEES_OR_NONCES", "SWEEP_CONSOLIDATION"]>;
export type ClusteringSignalType = z.infer<typeof ClusteringSignalTypeEnum>;
export declare const ClusteringSignalSchema: z.ZodObject<{
    type: z.ZodEnum<["COMMON_INPUT_OWNERSHIP", "CHANGE_ADDRESS_HEURISTIC", "TEMPORAL_PROXIMITY", "REPEATED_INTERACTION", "IDENTICAL_FEES_OR_NONCES", "SWEEP_CONSOLIDATION"]>;
    description: z.ZodString;
    confidence: z.ZodNumber;
    txHashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "COMMON_INPUT_OWNERSHIP" | "CHANGE_ADDRESS_HEURISTIC" | "TEMPORAL_PROXIMITY" | "REPEATED_INTERACTION" | "IDENTICAL_FEES_OR_NONCES" | "SWEEP_CONSOLIDATION";
    confidence: number;
    description: string;
    txHashes: string[];
}, {
    type: "COMMON_INPUT_OWNERSHIP" | "CHANGE_ADDRESS_HEURISTIC" | "TEMPORAL_PROXIMITY" | "REPEATED_INTERACTION" | "IDENTICAL_FEES_OR_NONCES" | "SWEEP_CONSOLIDATION";
    confidence: number;
    description: string;
    txHashes?: string[] | undefined;
}>;
export declare const WalletClusterSchema: z.ZodObject<{
    clusterId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    members: z.ZodArray<z.ZodString, "many">;
    primaryAddress: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
    signals: z.ZodArray<z.ZodString, "many">;
    detailedSignals: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
        confidence: z.ZodNumber;
        txHashes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        confidence: number;
        description: string;
        txHashes?: string[] | undefined;
    }, {
        type: string;
        confidence: number;
        description: string;
        txHashes?: string[] | undefined;
    }>, "many">>;
    chain: z.ZodString;
    totalTxCount: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodDate;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    chain: string;
    clusterId: string;
    confidence: number;
    members: string[];
    signals: string[];
    createdAt: Date;
    tags?: string[] | undefined;
    name?: string | undefined;
    primaryAddress?: string | undefined;
    detailedSignals?: {
        type: string;
        confidence: number;
        description: string;
        txHashes?: string[] | undefined;
    }[] | undefined;
    totalTxCount?: number | undefined;
}, {
    chain: string;
    clusterId: string;
    confidence: number;
    members: string[];
    signals: string[];
    createdAt: Date;
    tags?: string[] | undefined;
    name?: string | undefined;
    primaryAddress?: string | undefined;
    detailedSignals?: {
        type: string;
        confidence: number;
        description: string;
        txHashes?: string[] | undefined;
    }[] | undefined;
    totalTxCount?: number | undefined;
}>;
export type WalletCluster = z.infer<typeof WalletClusterSchema>;
//# sourceMappingURL=clustering.d.ts.map