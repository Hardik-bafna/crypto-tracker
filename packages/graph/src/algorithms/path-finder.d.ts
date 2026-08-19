import { TransactionGraph } from "../graph-model";
import { TracePathOptions, TracePathDetail } from "@crypto-tracer/types";
/**
 * Discovers multiple paths through an existing TransactionGraph from startAddress
 * to target destination (or any cash-out/known entity destination).
 * Reuses graph traversal logic without performing new external API calls.
 */
export declare function findMultipleTracePaths(graph: TransactionGraph, options: TracePathOptions): TracePathDetail[];
//# sourceMappingURL=path-finder.d.ts.map