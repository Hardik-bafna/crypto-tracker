import { GraphNode, GraphEdge, GraphData, GraphFilterOptions } from "@crypto-tracer/types";
export declare class TransactionGraph {
    private nodes;
    private edges;
    private outAdj;
    private inAdj;
    constructor(initialData?: GraphData);
    addNode(node: GraphNode): void;
    getNode(address: string): GraphNode | undefined;
    hasNode(address: string): boolean;
    getAllNodes(): GraphNode[];
    getNodeCount(): number;
    addEdge(edge: GraphEdge): void;
    getEdge(edgeId: string): GraphEdge | undefined;
    getAllEdges(): GraphEdge[];
    getEdgeCount(): number;
    getOutgoingEdges(address: string): GraphEdge[];
    getIncomingEdges(address: string): GraphEdge[];
    getOutgoingNeighbors(address: string): string[];
    getIncomingNeighbors(address: string): string[];
    loadData(data: GraphData): void;
    toJSON(): GraphData;
    filter(options: GraphFilterOptions): TransactionGraph;
}
//# sourceMappingURL=graph-model.d.ts.map