import { TransactionGraph } from "../graph-model";
export interface BFSResult {
    visitedNodes: string[];
    depthMap: Map<string, number>;
    predecessorMap: Map<string, string>;
}
export declare function bfs(graph: TransactionGraph, startAddress: string, options?: {
    direction?: "forward" | "backward" | "both";
    maxDepth?: number;
    maxNodes?: number;
}): BFSResult;
//# sourceMappingURL=bfs.d.ts.map