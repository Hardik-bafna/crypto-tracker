import { TransactionGraph } from "../graph-model";
export interface DFSResult {
    visitedNodes: string[];
    cycles: string[][];
    pathsToTarget: string[][];
}
export declare function dfsFindPaths(graph: TransactionGraph, sourceAddress: string, targetAddress?: string, options?: {
    maxDepth?: number;
    maxPaths?: number;
    direction?: "forward" | "backward";
}): DFSResult;
//# sourceMappingURL=dfs.d.ts.map