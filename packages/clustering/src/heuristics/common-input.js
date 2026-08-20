export function applyCommonInputHeuristic(transactions) {
    // DSU for addresses
    const parent = new Map();
    const txLinks = new Map();
    function find(i) {
        const p = parent.get(i);
        if (!p || p === i) {
            parent.set(i, i);
            return i;
        }
        const root = find(p);
        parent.set(i, root);
        return root;
    }
    function union(i, j) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) {
            parent.set(rootI, rootJ);
        }
    }
    for (const tx of transactions) {
        const inputAddrs = tx.inputs && tx.inputs.length > 1
            ? Array.from(new Set(tx.inputs.map((i) => i.address.toLowerCase())))
            : tx.from.length > 1
                ? Array.from(new Set(tx.from.map((f) => f.toLowerCase())))
                : [];
        if (inputAddrs.length > 1) {
            const first = inputAddrs[0];
            for (let i = 1; i < inputAddrs.length; i++) {
                union(first, inputAddrs[i]);
            }
            for (const addr of inputAddrs) {
                const root = find(addr);
                const set = txLinks.get(root) || new Set();
                set.add(tx.txHash);
                txLinks.set(root, set);
            }
        }
    }
    // Aggregate clusters
    const clusters = new Map();
    for (const [addr] of parent) {
        const root = find(addr);
        if (!clusters.has(root)) {
            clusters.set(root, { addrs: new Set(), txs: new Set() });
        }
        clusters.get(root).addrs.add(addr);
        const linkedTxs = txLinks.get(root);
        if (linkedTxs) {
            linkedTxs.forEach((tx) => clusters.get(root).txs.add(tx));
        }
    }
    const result = [];
    for (const [, { addrs, txs }] of clusters) {
        if (addrs.size > 1) {
            result.push({
                addresses: addrs,
                txHashes: txs,
                heuristic: "COMMON_INPUT_OWNERSHIP",
                confidence: 0.95, // Common input is one of the highest confidence heuristics
            });
        }
    }
    return result;
}
//# sourceMappingURL=common-input.js.map