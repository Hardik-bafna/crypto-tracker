import { NormalizedTransaction } from "@crypto-tracer/types";

export interface ClusterGroup {
  addresses: Set<string>;
  txHashes: Set<string>;
  heuristic: "COMMON_INPUT_OWNERSHIP";
  confidence: number;
}

export function applyCommonInputHeuristic(transactions: NormalizedTransaction[]): ClusterGroup[] {
  // DSU for addresses
  const parent = new Map<string, string>();
  const txLinks = new Map<string, Set<string>>();

  function find(i: string): string {
    const p = parent.get(i);
    if (!p || p === i) {
      parent.set(i, i);
      return i;
    }
    const root = find(p);
    parent.set(i, root);
    return root;
  }

  function union(i: string, j: string) {
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
        const set = txLinks.get(root) || new Set<string>();
        set.add(tx.txHash);
        txLinks.set(root, set);
      }
    }
  }

  // Aggregate clusters
  const clusters = new Map<string, { addrs: Set<string>; txs: Set<string> }>();
  for (const [addr] of parent) {
    const root = find(addr);
    if (!clusters.has(root)) {
      clusters.set(root, { addrs: new Set(), txs: new Set() });
    }
    clusters.get(root)!.addrs.add(addr);
    const linkedTxs = txLinks.get(root);
    if (linkedTxs) {
      linkedTxs.forEach((tx) => clusters.get(root)!.txs.add(tx));
    }
  }

  const result: ClusterGroup[] = [];
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
