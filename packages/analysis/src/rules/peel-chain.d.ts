import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult } from "@crypto-tracer/types";
export declare function detectPeelChain(graph: TransactionGraph, options?: {
    minHops?: number;
    peelRatioThreshold?: number;
}): PatternDetectionResult[];
//# sourceMappingURL=peel-chain.d.ts.map