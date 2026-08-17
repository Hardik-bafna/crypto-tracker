import { describe, it, expect } from "bun:test";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { SyntheticBlockchainAdapter } from "@crypto-tracer/blockchain";

describe("Wallet Clustering Engine", () => {
  const synth = new SyntheticBlockchainAdapter("bitcoin");
  const txs = synth.getAllSyntheticTransactions();
  const clusterEngine = new ClusterEngine();

  it("should cluster co-spent multi-input Bitcoin addresses", () => {
    const clusters = clusterEngine.clusterWallets(txs, "bitcoin");
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0].confidence).toBeGreaterThanOrEqual(0.8);
    expect(clusters[0].signals.length).toBeGreaterThan(0);
  });
});
