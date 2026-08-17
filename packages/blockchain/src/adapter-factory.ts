import { BlockchainAdapter } from "@crypto-tracer/types";
import { BitcoinAdapter } from "./bitcoin-adapter";
import { EthereumAdapter } from "./ethereum-adapter";
import { SyntheticBlockchainAdapter } from "./synthetic-adapter";
import { MoneroAdapter } from "./monero-adapter";

export class BlockchainAdapterFactory {
  private static adapters: Map<string, BlockchainAdapter> = new Map();
  private static syntheticAdapter: SyntheticBlockchainAdapter = new SyntheticBlockchainAdapter();

  static getAdapter(chain: string): BlockchainAdapter {
    const normalizedChain = chain.toLowerCase().trim();

    if (this.adapters.has(normalizedChain)) {
      return this.adapters.get(normalizedChain)!;
    }

    let adapter: BlockchainAdapter;
    switch (normalizedChain) {
      case "bitcoin":
      case "btc":
        adapter = new BitcoinAdapter(this.syntheticAdapter.getAllSyntheticTransactions());
        break;
      case "ethereum":
      case "eth":
      case "erc20":
        adapter = new EthereumAdapter(this.syntheticAdapter.getAllSyntheticTransactions());
        break;
      case "monero":
      case "xmr":
        adapter = new MoneroAdapter();
        break;
      case "synthetic":
      default:
        adapter = this.syntheticAdapter;
        break;
    }

    this.adapters.set(normalizedChain, adapter);
    return adapter;
  }

  static detectChain(input: string): { chain: string; type: "address" | "txHash" | "unknown" } {
    const clean = input.trim();
    if (!clean) return { chain: "unknown", type: "unknown" };

    // ETH address: 0x followed by 40 hex chars
    if (/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      return { chain: "ethereum", type: "address" };
    }

    // ETH or BTC 64 hex char tx hash
    if (/^0x[a-fA-F0-9]{64}$/.test(clean)) {
      return { chain: "ethereum", type: "txHash" };
    }
    if (/^[a-fA-F0-9]{64}$/.test(clean)) {
      return { chain: "bitcoin", type: "txHash" };
    }

    // BTC addresses: legacy (1..), P2SH (3..), SegWit (bc1..)
    if (/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/i.test(clean)) {
      return { chain: "bitcoin", type: "address" };
    }

    // Monero addresses (starts with 4 or 8, 95 or 106 chars)
    if (/^(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}|8[0-9AB][1-9A-HJ-NP-Za-km-z]{93}|4[0-9AB][1-9A-HJ-NP-Za-km-z]{104})$/.test(clean)) {
      return { chain: "monero", type: "address" };
    }

    return { chain: "synthetic", type: clean.length > 50 ? "txHash" : "address" };
  }
}
