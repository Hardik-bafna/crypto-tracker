import { TransactionGraph } from "../graph-model";
import { GraphData, TraversalOptions } from "@crypto-tracer/types";
export interface NHopResult {
    graph: TransactionGraph;
    data: GraphData;
    hopStats: {
        hop: number;
        nodeCount: number;
        edgeCount: number;
        volume: string;
    }[];
    totalVolume: string;
    maxHopReached: number;
}
export declare function nHopTraversal(graph: TransactionGraph, originAddress: string, options: TraversalOptions): NHopResult;
//# sourceMappingURL=n-hop.d.ts.map