import { TransactionGraph } from "../graph-model";
import { GraphEdge, PathResult } from "@crypto-tracer/types";
export declare function compositeForensicWeight(edge: GraphEdge, graph: TransactionGraph): number;
export declare function dijkstraShortestPath(graph: TransactionGraph, sourceAddress: string, targetAddress: string, weightFn?: (edge: GraphEdge) => number): PathResult | null;
//# sourceMappingURL=dijkstra.d.ts.map