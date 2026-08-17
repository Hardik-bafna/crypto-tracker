import {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphFilterOptions,
} from "@crypto-tracer/types";

export class TransactionGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private outAdj: Map<string, Set<string>> = new Map(); // node -> Set<edgeId>
  private inAdj: Map<string, Set<string>> = new Map();  // node -> Set<edgeId>

  constructor(initialData?: GraphData) {
    if (initialData) {
      this.loadData(initialData);
    }
  }

  addNode(node: GraphNode): void {
    const key = node.address.toLowerCase();
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { ...node, id: key });
    } else {
      // Merge properties if updated
      const existing = this.nodes.get(key)!;
      this.nodes.set(key, {
        ...existing,
        ...node,
        id: key,
        tags: Array.from(new Set([...(existing.tags || []), ...(node.tags || [])])),
        isTarget: existing.isTarget || node.isTarget,
        isSuspect: existing.isSuspect || node.isSuspect,
      });
    }

    if (!this.outAdj.has(key)) this.outAdj.set(key, new Set());
    if (!this.inAdj.has(key)) this.inAdj.set(key, new Set());
  }

  getNode(address: string): GraphNode | undefined {
    return this.nodes.get(address.toLowerCase());
  }

  hasNode(address: string): boolean {
    return this.nodes.has(address.toLowerCase());
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  addEdge(edge: GraphEdge): void {
    const sourceKey = edge.source.toLowerCase();
    const targetKey = edge.target.toLowerCase();
    const edgeId = edge.id || `edge-${edge.txHash}-${sourceKey}-${targetKey}`;

    const normalizedEdge: GraphEdge = {
      ...edge,
      id: edgeId,
      source: sourceKey,
      target: targetKey,
    };

    this.edges.set(edgeId, normalizedEdge);

    if (!this.outAdj.has(sourceKey)) this.outAdj.set(sourceKey, new Set());
    if (!this.inAdj.has(targetKey)) this.inAdj.set(targetKey, new Set());

    this.outAdj.get(sourceKey)!.add(edgeId);
    this.inAdj.get(targetKey)!.add(edgeId);
  }

  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  getEdgeCount(): number {
    return this.edges.size;
  }

  getOutgoingEdges(address: string): GraphEdge[] {
    const edgeIds = this.outAdj.get(address.toLowerCase());
    if (!edgeIds) return [];
    return Array.from(edgeIds)
      .map((id) => this.edges.get(id))
      .filter((e): e is GraphEdge => !!e);
  }

  getIncomingEdges(address: string): GraphEdge[] {
    const edgeIds = this.inAdj.get(address.toLowerCase());
    if (!edgeIds) return [];
    return Array.from(edgeIds)
      .map((id) => this.edges.get(id))
      .filter((e): e is GraphEdge => !!e);
  }

  getOutgoingNeighbors(address: string): string[] {
    const edges = this.getOutgoingEdges(address);
    return Array.from(new Set(edges.map((e) => e.target)));
  }

  getIncomingNeighbors(address: string): string[] {
    const edges = this.getIncomingEdges(address);
    return Array.from(new Set(edges.map((e) => e.source)));
  }

  loadData(data: GraphData): void {
    data.nodes.forEach((n) => this.addNode(n));
    data.edges.forEach((e) => this.addEdge(e));
  }

  toJSON(): GraphData {
    return {
      nodes: this.getAllNodes(),
      edges: this.getAllEdges(),
    };
  }

  filter(options: GraphFilterOptions): TransactionGraph {
    const filtered = new TransactionGraph();
    const allowedEdges: GraphEdge[] = [];
    const neededNodes = new Set<string>();

    for (const edge of this.edges.values()) {
      if (options.chain && edge.chain.toLowerCase() !== options.chain.toLowerCase()) {
        continue;
      }
      if (options.asset && edge.asset.toUpperCase() !== options.asset.toUpperCase()) {
        continue;
      }
      if (options.minAmount) {
        const val = parseFloat(edge.amount);
        const min = parseFloat(options.minAmount);
        if (!isNaN(val) && !isNaN(min) && val < min) continue;
      }
      if (options.maxAmount) {
        const val = parseFloat(edge.amount);
        const max = parseFloat(options.maxAmount);
        if (!isNaN(val) && !isNaN(max) && val > max) continue;
      }
      if (options.startTime && edge.timestamp < options.startTime) {
        continue;
      }
      if (options.endTime && edge.timestamp > options.endTime) {
        continue;
      }

      allowedEdges.push(edge);
      neededNodes.add(edge.source);
      neededNodes.add(edge.target);
    }

    for (const nodeAddr of neededNodes) {
      const node = this.nodes.get(nodeAddr);
      if (node) {
        if (
          options.entityTypes &&
          options.entityTypes.length > 0 &&
          node.entityType &&
          !options.entityTypes.includes(node.entityType)
        ) {
          continue;
        }
        filtered.addNode(node);
      }
    }

    for (const edge of allowedEdges) {
      if (filtered.hasNode(edge.source) && filtered.hasNode(edge.target)) {
        filtered.addEdge(edge);
      }
    }

    return filtered;
  }
}
