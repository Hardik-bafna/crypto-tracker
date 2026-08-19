export class TransactionGraph {
    nodes = new Map();
    edges = new Map();
    outAdj = new Map(); // node -> Set<edgeId>
    inAdj = new Map(); // node -> Set<edgeId>
    constructor(initialData) {
        if (initialData) {
            this.loadData(initialData);
        }
    }
    addNode(node) {
        const key = node.address.toLowerCase();
        if (!this.nodes.has(key)) {
            this.nodes.set(key, { ...node, id: key });
        }
        else {
            // Merge properties if updated
            const existing = this.nodes.get(key);
            this.nodes.set(key, {
                ...existing,
                ...node,
                id: key,
                tags: Array.from(new Set([...(existing.tags || []), ...(node.tags || [])])),
                isTarget: existing.isTarget || node.isTarget,
                isSuspect: existing.isSuspect || node.isSuspect,
            });
        }
        if (!this.outAdj.has(key))
            this.outAdj.set(key, new Set());
        if (!this.inAdj.has(key))
            this.inAdj.set(key, new Set());
    }
    getNode(address) {
        return this.nodes.get(address.toLowerCase());
    }
    hasNode(address) {
        return this.nodes.has(address.toLowerCase());
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getNodeCount() {
        return this.nodes.size;
    }
    addEdge(edge) {
        const sourceKey = edge.source.toLowerCase();
        const targetKey = edge.target.toLowerCase();
        const edgeId = edge.id || `edge-${edge.txHash}-${sourceKey}-${targetKey}`;
        const normalizedEdge = {
            ...edge,
            id: edgeId,
            source: sourceKey,
            target: targetKey,
        };
        this.edges.set(edgeId, normalizedEdge);
        if (!this.outAdj.has(sourceKey))
            this.outAdj.set(sourceKey, new Set());
        if (!this.inAdj.has(targetKey))
            this.inAdj.set(targetKey, new Set());
        this.outAdj.get(sourceKey).add(edgeId);
        this.inAdj.get(targetKey).add(edgeId);
    }
    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }
    getAllEdges() {
        return Array.from(this.edges.values());
    }
    getEdgeCount() {
        return this.edges.size;
    }
    getOutgoingEdges(address) {
        const edgeIds = this.outAdj.get(address.toLowerCase());
        if (!edgeIds)
            return [];
        return Array.from(edgeIds)
            .map((id) => this.edges.get(id))
            .filter((e) => !!e);
    }
    getIncomingEdges(address) {
        const edgeIds = this.inAdj.get(address.toLowerCase());
        if (!edgeIds)
            return [];
        return Array.from(edgeIds)
            .map((id) => this.edges.get(id))
            .filter((e) => !!e);
    }
    getOutgoingNeighbors(address) {
        const edges = this.getOutgoingEdges(address);
        return Array.from(new Set(edges.map((e) => e.target)));
    }
    getIncomingNeighbors(address) {
        const edges = this.getIncomingEdges(address);
        return Array.from(new Set(edges.map((e) => e.source)));
    }
    loadData(data) {
        data.nodes.forEach((n) => this.addNode(n));
        data.edges.forEach((e) => this.addEdge(e));
    }
    toJSON() {
        return {
            nodes: this.getAllNodes(),
            edges: this.getAllEdges(),
        };
    }
    filter(options) {
        const filtered = new TransactionGraph();
        const allowedEdges = [];
        const neededNodes = new Set();
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
                if (!isNaN(val) && !isNaN(min) && val < min)
                    continue;
            }
            if (options.maxAmount) {
                const val = parseFloat(edge.amount);
                const max = parseFloat(options.maxAmount);
                if (!isNaN(val) && !isNaN(max) && val > max)
                    continue;
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
                if (options.entityTypes &&
                    options.entityTypes.length > 0 &&
                    node.entityType &&
                    !options.entityTypes.includes(node.entityType)) {
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
//# sourceMappingURL=graph-model.js.map