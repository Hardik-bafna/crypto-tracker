import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult } from "@crypto-tracer/types";
export declare function detectFanOut(graph: TransactionGraph, options?: {
    threshold?: number;
    windowSeconds?: number;
}): PatternDetectionResult[];
//# sourceMappingURL=fan-out.d.ts.map