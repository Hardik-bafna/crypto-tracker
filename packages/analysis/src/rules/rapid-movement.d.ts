import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult } from "@crypto-tracer/types";
export declare function detectRapidMovement(graph: TransactionGraph, options?: {
    maxIntervalSeconds?: number;
    minHops?: number;
}): PatternDetectionResult[];
//# sourceMappingURL=rapid-movement.d.ts.map