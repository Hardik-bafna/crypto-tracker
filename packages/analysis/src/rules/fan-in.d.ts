import { TransactionGraph } from "@crypto-tracer/graph";
import { PatternDetectionResult } from "@crypto-tracer/types";
export declare function detectFanIn(graph: TransactionGraph, options?: {
    threshold?: number;
    windowSeconds?: number;
}): PatternDetectionResult[];
//# sourceMappingURL=fan-in.d.ts.map