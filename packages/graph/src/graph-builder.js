import { TransactionGraph } from "./graph-model";
export class GraphBuilder {
    /**
     * Builds a TransactionGraph from a set of normalized transactions
     */
    static buildFromTransactions(transactions, targetAddressOrTx) {
        const graph = new TransactionGraph();
        const targetClean = targetAddressOrTx?.toLowerCase();
        for (const tx of transactions) {
            // Process UTXO outputs/inputs if available, or direct from/to
            if (tx.inputs && tx.outputs && tx.inputs.length > 0 && tx.outputs.length > 0) {
                // Bitcoin UTXO model
                for (const input of tx.inputs) {
                    const fromAddr = input.address.toLowerCase();
                    if (!graph.hasNode(fromAddr)) {
                        graph.addNode({
                            id: fromAddr,
                            address: input.address,
                            label: `${input.address.slice(0, 8)}...${input.address.slice(-6)}`,
                            type: "address",
                            chain: tx.chain,
                            isTarget: targetClean === fromAddr || targetClean === tx.txHash.toLowerCase(),
                        });
                    }
                    for (const output of tx.outputs) {
                        const toAddr = output.address.toLowerCase();
                        if (!graph.hasNode(toAddr)) {
                            graph.addNode({
                                id: toAddr,
                                address: output.address,
                                label: `${output.address.slice(0, 8)}...${output.address.slice(-6)}`,
                                type: "address",
                                chain: tx.chain,
                                isTarget: targetClean === toAddr,
                            });
                        }
                        const outAmtNum = (Number(BigInt(output.amount)) / 1e8).toFixed(8);
                        const edgeId = `edge-${tx.txHash}-${input.outputIndex}-${output.index}`;
                        graph.addEdge({
                            id: edgeId,
                            source: fromAddr,
                            target: toAddr,
                            txHash: tx.txHash,
                            asset: "BTC",
                            amount: output.amount,
                            formattedAmount: `${outAmtNum} BTC`,
                            timestamp: tx.timestamp,
                            chain: tx.chain,
                            fee: tx.fee,
                            confidence: 1.0,
                        });
                    }
                }
            }
            else if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                // Token transfers (e.g. USDT)
                for (const tt of tx.tokenTransfers) {
                    const fromAddr = tt.from.toLowerCase();
                    const toAddr = tt.to.toLowerCase();
                    if (!graph.hasNode(fromAddr)) {
                        graph.addNode({
                            id: fromAddr,
                            address: tt.from,
                            label: `${tt.from.slice(0, 6)}...${tt.from.slice(-4)}`,
                            type: "address",
                            chain: tx.chain,
                            isTarget: targetClean === fromAddr || targetClean === tx.txHash.toLowerCase(),
                        });
                    }
                    if (!graph.hasNode(toAddr)) {
                        graph.addNode({
                            id: toAddr,
                            address: tt.to,
                            label: `${tt.to.slice(0, 6)}...${tt.to.slice(-4)}`,
                            type: "address",
                            chain: tx.chain,
                            isTarget: targetClean === toAddr,
                        });
                    }
                    const edgeId = `edge-token-${tx.txHash}-${fromAddr}-${toAddr}`;
                    graph.addEdge({
                        id: edgeId,
                        source: fromAddr,
                        target: toAddr,
                        txHash: tx.txHash,
                        asset: tt.tokenSymbol,
                        amount: tt.amount,
                        formattedAmount: tt.formattedAmount || `${tt.amount} ${tt.tokenSymbol}`,
                        timestamp: tx.timestamp,
                        chain: tx.chain,
                        isTokenTransfer: true,
                        tokenSymbol: tt.tokenSymbol,
                        isContractCall: true,
                        isCrossChain: Boolean(tx.metadata?.isCrossChain),
                        bridgeName: tx.metadata?.bridgeName || undefined,
                        confidence: 1.0,
                    });
                }
            }
            else {
                // Standard account-based transfer (Ethereum ETH, etc.)
                for (const from of tx.from) {
                    const fromAddr = from.toLowerCase();
                    if (!graph.hasNode(fromAddr)) {
                        graph.addNode({
                            id: fromAddr,
                            address: from,
                            label: `${from.slice(0, 6)}...${from.slice(-4)}`,
                            type: tx.isContractCall ? "contract" : "address",
                            chain: tx.chain,
                            isTarget: targetClean === fromAddr || targetClean === tx.txHash.toLowerCase(),
                        });
                    }
                    for (const to of tx.to) {
                        const toAddr = to.toLowerCase();
                        if (!graph.hasNode(toAddr)) {
                            graph.addNode({
                                id: toAddr,
                                address: to,
                                label: `${to.slice(0, 6)}...${to.slice(-4)}`,
                                type: tx.isContractCall ? "contract" : "address",
                                chain: tx.chain,
                                isTarget: targetClean === toAddr,
                            });
                        }
                        const edgeId = `edge-${tx.txHash}-${fromAddr}-${toAddr}`;
                        graph.addEdge({
                            id: edgeId,
                            source: fromAddr,
                            target: toAddr,
                            txHash: tx.txHash,
                            asset: tx.asset,
                            amount: tx.amount,
                            formattedAmount: tx.formattedAmount || `${tx.amount} ${tx.asset}`,
                            timestamp: tx.timestamp,
                            chain: tx.chain,
                            fee: tx.fee,
                            isContractCall: tx.isContractCall,
                            isCrossChain: Boolean(tx.metadata?.isCrossChain),
                            bridgeName: tx.metadata?.bridgeName || undefined,
                            confidence: 1.0,
                        });
                    }
                }
            }
        }
        return graph;
    }
    /**
     * Ingests from blockchain adapter recursively up to maxHops
     */
    static async ingestAndBuild(adapter, startAddress, maxHops = 5, direction = "forward") {
        const graph = new TransactionGraph();
        const visited = new Set();
        let currentQueue = [];
        // Check if the input is a TxHash instead of an Address
        // Addresses always take priority - only route as tx hash if it is NOT a valid address
        const isAddress = adapter.validateAddress ? adapter.validateAddress(startAddress) : false;
        const isTxHash = !isAddress && adapter.validateTxHash ? adapter.validateTxHash(startAddress) : false;
        if (isTxHash) {
            if (adapter.getTransaction) {
                const tx = await adapter.getTransaction(startAddress);
                if (tx) {
                    const subGraph = GraphBuilder.buildFromTransactions([tx], startAddress);
                    for (const node of subGraph.getAllNodes()) {
                        graph.addNode(node);
                    }
                    for (const edge of subGraph.getAllEdges()) {
                        graph.addEdge(edge);
                    }
                    // Seed the queue with the addresses involved in the transaction (preserve original case)
                    if (direction === "forward" || direction === "both") {
                        tx.to.forEach(addr => currentQueue.push(addr));
                        if (tx.tokenTransfers)
                            tx.tokenTransfers.forEach(tt => currentQueue.push(tt.to));
                    }
                    if (direction === "backward" || direction === "both") {
                        tx.from.forEach(addr => currentQueue.push(addr));
                        if (tx.tokenTransfers)
                            tx.tokenTransfers.forEach(tt => currentQueue.push(tt.from));
                    }
                }
            }
        }
        else {
            currentQueue.push(startAddress); // preserve original case for API calls
        }
        for (let hop = 0; hop < maxHops; hop++) {
            const nextQueue = [];
            for (const addr of currentQueue) {
                const addrLower = addr.toLowerCase();
                if (visited.has(addrLower))
                    continue;
                visited.add(addrLower);
                const txs = await adapter.getAddressTransactions(addr, {
                    direction: direction === "both" ? "all" : direction === "forward" ? "outbound" : "inbound",
                    limit: 25,
                });
                const subGraph = GraphBuilder.buildFromTransactions(txs, startAddress);
                for (const node of subGraph.getAllNodes()) {
                    graph.addNode(node);
                    if (!visited.has(node.address.toLowerCase())) {
                        nextQueue.push(node.address); // preserve original case for API calls
                    }
                }
                for (const edge of subGraph.getAllEdges()) {
                    graph.addEdge(edge);
                }
            }
            currentQueue = nextQueue;
            if (currentQueue.length === 0)
                break;
        }
        return graph;
    }
}
//# sourceMappingURL=graph-builder.js.map