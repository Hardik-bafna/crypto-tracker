import { describe, it, expect } from "bun:test";
import {
  BitcoinAdapter,
  EthereumAdapter,
  ERC20Adapter,
  MoneroAdapter,
  SyntheticBlockchainAdapter,
  BlockchainAdapterFactory,
} from "@crypto-tracer/blockchain";

describe("Blockchain Adapters & Normalization", () => {
  describe("BitcoinAdapter", () => {
    it("should validate Bitcoin legacy, P2SH, and Bech32 addresses correctly", () => {
      const adapter = new BitcoinAdapter();
      expect(adapter.validateAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")).toBe(true);
      expect(adapter.validateAddress("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy")).toBe(true);
      expect(adapter.validateAddress("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(true);
      expect(adapter.validateAddress("0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001")).toBe(false);
      expect(adapter.validateAddress("invalid_address")).toBe(false);
    });

    it("should preserve UTXO inputs and outputs during normalization", () => {
      const tx = BitcoinAdapter.createBitcoinTransaction({
        txHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
        timestamp: new Date("2026-08-01T10:00:00Z"),
        inputs: [
          { txHash: "prev-hash-1", outputIndex: 0, address: "bc1qsource1", amount: "150000000" },
          { txHash: "prev-hash-2", outputIndex: 1, address: "bc1qsource2", amount: "100000000" },
        ],
        outputs: [
          { index: 0, address: "bc1qdest1", amount: "200000000" },
          { index: 1, address: "bc1qchange", amount: "49900000", isChange: true },
        ],
        feeSats: 100000,
      });

      expect(tx.chain).toBe("bitcoin");
      expect(tx.inputs).toHaveLength(2);
      expect(tx.outputs).toHaveLength(2);
      expect(tx.amount).toBe("249900000");
      expect(tx.formattedAmount).toBe("2.49900000 BTC");
    });
  });

  describe("EthereumAdapter & ERC20Adapter", () => {
    it("should validate Ethereum addresses and tx hashes", () => {
      const adapter = new EthereumAdapter();
      expect(adapter.validateAddress("0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001")).toBe(true);
      expect(adapter.validateAddress("0xinvalid")).toBe(false);
      expect(adapter.validateTxHash("0x4a1f8e9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e90")).toBe(true);
    });

    it("should parse ERC-20 USDT token transfers with 6 decimal places", () => {
      const transfer = ERC20Adapter.parseTransfer({
        contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        from: "0xsource",
        to: "0xdest",
        rawAmount: "5000000000", // 5000 USDT
        txHash: "0xtx",
        timestamp: new Date(),
      });

      expect(transfer.tokenSymbol).toBe("USDT");
      expect(transfer.tokenDecimals).toBe(6);
      expect(transfer.formattedAmount).toBe("5000 USDT");
    });
  });

  describe("Monero Privacy Guardrail", () => {
    it("should return LIMITED traceability status for Monero", () => {
      const adapter = new MoneroAdapter();
      const status = adapter.getTraceabilityStatus();
      expect(status.traceability).toBe("LIMITED");
      expect(status.reason).toBe("PRIVACY_MECHANISM");
    });
  });

  describe("BlockchainAdapterFactory", () => {
    it("should automatically detect chain from address format", () => {
      expect(BlockchainAdapterFactory.detectChain("0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001").chain).toBe("ethereum");
      expect(BlockchainAdapterFactory.detectChain("bc1q9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d").chain).toBe("bitcoin");
      expect(BlockchainAdapterFactory.detectChain("1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s").chain).toBe("bitcoin");
    });
  });
});
