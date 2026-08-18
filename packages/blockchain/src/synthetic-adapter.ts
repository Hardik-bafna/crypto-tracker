import {
  NormalizedTransaction,
  PaginationOptions,
  AddressBalance,
  TokenTransfer,
} from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";

export interface SyntheticDemoCase {
  id: string;
  name: string;
  category: string;
  description: string;
  suspectAddress: string;
  initialTxHash: string;
  chain: string;
  recommendedHops: number;
  expectedPatterns: string[];
  expectedRiskLevel: "HIGH" | "CRITICAL";
  narrative: string;
}

export const SYNTHETIC_DEMO_CASES: SyntheticDemoCase[] = [
  {
    id: "case-silk-trail",
    name: "Operation Silk Trail (Narcotics Pipeline)",
    category: "Narcotics Trafficking & Mixer Evasion",
    description:
      "Tracing illicit drug proceeds moving from a flagged Darknet vendor wallet through a peel chain, mixing pool (Tornado Cash), cross-chain bridge, and ending in a KYC Exchange deposit.",
    suspectAddress: "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001",
    initialTxHash: "0x4a1f8e9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e90",
    chain: "ethereum",
    recommendedHops: 6,
    expectedPatterns: ["PEEL_CHAIN", "MIXER_INTERACTION", "BRIDGE_INTERACTION", "RAPID_MOVEMENT"],
    expectedRiskLevel: "CRITICAL",
    narrative:
      "Investigative target 0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001 is linked to fentanyl distribution marketplaces. On 2026-08-01, 150 ETH was moved through intermediary addresses, peeled into smaller increments, anonymized via Tornado Cash, routed across Synapse Bridge, and finally deposited to Binance.",
  },
  {
    id: "case-hydra-flow",
    name: "Operation Hydra Flow (Syndicate Fan-Out)",
    category: "Money Laundering & Fan-Out Structuring",
    description:
      "Suspected cartel distribution hub executing a 1-to-8 fan-out dispersal to smurfing mules, followed by rapid multi-wallet hops and fan-in aggregation.",
    suspectAddress: "bc1q9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d",
    initialTxHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    chain: "bitcoin",
    recommendedHops: 5,
    expectedPatterns: ["FAN_OUT", "FAN_IN", "RAPID_MOVEMENT", "HIGH_HOP_MOVEMENT"],
    expectedRiskLevel: "HIGH",
    narrative:
      "A primary distribution node bc1q9d8e7... dispersed 24.5 BTC across 8 unhosted wallets within 15 minutes, which subsequently hopped through secondary addresses before reconverging at a centralized deposit address.",
  },
  {
    id: "case-phantom-vault",
    name: "Operation Phantom Vault (USDT Token Laundering)",
    category: "Stablecoin Laundering & Structuring",
    description:
      "High-hop layered structuring of $500,000 USDT across multiple synthetic intermediate addresses and swap protocols.",
    suspectAddress: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    initialTxHash: "0x9f8e7d6c5b4a3928170f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a1",
    chain: "ethereum",
    recommendedHops: 5,
    expectedPatterns: ["HIGH_HOP_MOVEMENT", "RAPID_MOVEMENT", "PEEL_CHAIN"],
    expectedRiskLevel: "HIGH",
    narrative:
      "High-velocity ERC-20 Tether transfers structuring large payments across layered intermediary addresses to avoid exchange AML thresholds.",
  },
];

export class SyntheticBlockchainAdapter extends BaseBlockchainAdapter {
  readonly chain: string;
  private transactions: NormalizedTransaction[] = [];
  private txMap: Map<string, NormalizedTransaction> = new Map();
  private addressMap: Map<string, string[]> = new Map();

  constructor(chain: string = "ethereum") {
    super();
    this.chain = chain;
    this.initSyntheticData();
  }

  private initSyntheticData(): void {
    const baseTime = new Date("2026-08-01T12:00:00Z").getTime();

    // ==========================================
    // CASE 1: Operation Silk Trail (Ethereum)
    // ==========================================
    const silkTxs: NormalizedTransaction[] = [
      // Hop 0: Suspect Darknet wallet -> Wallet A (Peel step 1)
      {
        id: "tx-silk-01",
        chain: "ethereum",
        txHash: "0x4a1f8e9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e90",
        blockNumber: 19540100,
        timestamp: new Date(baseTime),
        from: ["0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001"], // Target / Darknet Vendor
        to: ["0x21a31ee1afc51d94c2efccaa2092ad1028285549", "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001"],
        asset: "ETH",
        amount: "150000000000000000000",
        formattedAmount: "150.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 1, note: "Initial Darknet Fund Transfer" },
      },
      // Hop 1: Wallet A -> Wallet B (Peel chain: 140 ETH forward, 10 ETH fee/peel)
      {
        id: "tx-silk-02",
        chain: "ethereum",
        txHash: "0x5b2e9d8c7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d",
        blockNumber: 19540108,
        timestamp: new Date(baseTime + 10 * 60 * 1000), // +10 mins
        from: ["0x21a31ee1afc51d94c2efccaa2092ad1028285549"],
        to: ["0x33b42ff2b0d62e05d3f0ddbb3103be2139396650"],
        asset: "ETH",
        amount: "140000000000000000000",
        formattedAmount: "140.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 2, note: "Peel Chain Layer 1" },
      },
      // Hop 2: Wallet B -> Split into Wallet C (70 ETH) & Wallet D (70 ETH)
      {
        id: "tx-silk-03a",
        chain: "ethereum",
        txHash: "0x6c3f0e9d8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e",
        blockNumber: 19540115,
        timestamp: new Date(baseTime + 22 * 60 * 1000), // +22 mins
        from: ["0x33b42ff2b0d62e05d3f0ddbb3103be2139396650"],
        to: ["0x44c53ee3c1e73f16e4a1eecc4214cf3240407761"], // Wallet C
        asset: "ETH",
        amount: "70000000000000000000",
        formattedAmount: "70.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 3, note: "Fan-out Split A" },
      },
      {
        id: "tx-silk-03b",
        chain: "ethereum",
        txHash: "0x7d4a1f0e9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f",
        blockNumber: 19540116,
        timestamp: new Date(baseTime + 25 * 60 * 1000), // +25 mins
        from: ["0x33b42ff2b0d62e05d3f0ddbb3103be2139396650"],
        to: ["0x55d64ff4d2f84a27f5b2ffdd5325da4351518872"], // Wallet D
        asset: "ETH",
        amount: "70000000000000000000",
        formattedAmount: "70.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 3, note: "Fan-out Split B" },
      },
      // Hop 3: Wallets C & D -> Tornado Cash Mixer (0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b)
      {
        id: "tx-silk-04a",
        chain: "ethereum",
        txHash: "0x8e5b2a1f0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a",
        blockNumber: 19540130,
        timestamp: new Date(baseTime + 45 * 60 * 1000),
        from: ["0x44c53ee3c1e73f16e4a1eecc4214cf3240407761"],
        to: ["0xd90e2f925da726b50c4ed8d0fb90ad053324f31b"], // Tornado Cash 100 ETH Pool
        asset: "ETH",
        amount: "70000000000000000000",
        formattedAmount: "70.0 ETH",
        status: "confirmed",
        isContractCall: true,
        contractAddress: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b",
        metadata: { scenario: "silk-trail", step: 4, note: "Mixer Deposit C" },
      },
      {
        id: "tx-silk-04b",
        chain: "ethereum",
        txHash: "0x9f6c3b2a1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b",
        blockNumber: 19540132,
        timestamp: new Date(baseTime + 48 * 60 * 1000),
        from: ["0x55d64ff4d2f84a27f5b2ffdd5325da4351518872"],
        to: ["0xd90e2f925da726b50c4ed8d0fb90ad053324f31b"], // Tornado Cash 100 ETH Pool
        asset: "ETH",
        amount: "70000000000000000000",
        formattedAmount: "70.0 ETH",
        status: "confirmed",
        isContractCall: true,
        contractAddress: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b",
        metadata: { scenario: "silk-trail", step: 4, note: "Mixer Deposit D" },
      },
      // Hop 4: Tornado Cash Mixer Relayer -> Clean Intermediary Wallet E
      {
        id: "tx-silk-05",
        chain: "ethereum",
        txHash: "0xa07d4c3b2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c",
        blockNumber: 19540180,
        timestamp: new Date(baseTime + 180 * 60 * 1000), // +3 hours
        from: ["0xd90e2f925da726b50c4ed8d0fb90ad053324f31b"], // Tornado Cash
        to: ["0x66e75aa5e3f95b38f6c3fffe6436eb5462629983"], // Wallet E
        asset: "ETH",
        amount: "138000000000000000000",
        formattedAmount: "138.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 5, note: "Mixer Withdrawal to Unlinked Address" },
      },
      // Hop 5: Wallet E -> Synapse Bridge Router (0x2796317b0fF8538F253012862c06787Adfb8cEb6)
      {
        id: "tx-silk-06",
        chain: "ethereum",
        txHash: "0xb18e5d4c3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d",
        blockNumber: 19540200,
        timestamp: new Date(baseTime + 210 * 60 * 1000), // +3.5 hours
        from: ["0x66e75aa5e3f95b38f6c3fffe6436eb5462629983"],
        to: ["0x2796317b0ff8538f253012862c06787adfb8ceb6"], // Synapse Bridge
        asset: "ETH",
        amount: "135000000000000000000",
        formattedAmount: "135.0 ETH",
        status: "confirmed",
        isContractCall: true,
        contractAddress: "0x2796317b0ff8538f253012862c06787adfb8ceb6",
        metadata: {
          scenario: "silk-trail",
          step: 6,
          isCrossChain: true,
          destinationChain: "arbitrum",
          note: "Cross-Chain Bridge Routing",
        },
      },
      // Hop 6: Bridge Outflow -> Destination Wallet F -> Binance Hot Wallet
      {
        id: "tx-silk-07",
        chain: "ethereum",
        txHash: "0xc29f6e5d4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e",
        blockNumber: 19540220,
        timestamp: new Date(baseTime + 240 * 60 * 1000), // +4 hours
        from: ["0x77f86bb6f4a06c49a7d4aaff7547fc6573730094"], // Wallet F
        to: ["0x28c6c06298d514db089934071355e5743bf21d60"], // Binance Exchange Deposit
        asset: "ETH",
        amount: "134000000000000000000",
        formattedAmount: "134.0 ETH",
        status: "confirmed",
        metadata: { scenario: "silk-trail", step: 7, note: "Cashout Deposit to KYC Exchange" },
      },
    ];

    // ==========================================
    // CASE 2: Operation Hydra Flow (Bitcoin)
    // ==========================================
    const btcBaseTime = new Date("2026-08-05T09:00:00Z").getTime();
    const suspectBtc = "bc1q9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d";
    const muleAddresses = [
      "bc1qmule11111111111111111111111111111111111",
      "bc1qmule22222222222222222222222222222222222",
      "bc1qmule33333333333333333333333333333333333",
      "bc1qmule44444444444444444444444444444444444",
      "bc1qmule55555555555555555555555555555555555",
      "bc1qmule66666666666666666666666666666666666",
      "bc1qmule77777777777777777777777777777777777",
      "bc1qmule88888888888888888888888888888888888",
    ];
    const aggregatorBtc = "bc1qaggregator999999999999999999999999999";
    const krakenDeposit = "bc1qkraken00000000000000000000000000000000";

    const hydraTxs: NormalizedTransaction[] = [
      // Multi-input co-spend transaction establishing co-ownership cluster
      {
        id: "tx-btc-cluster-00",
        chain: "bitcoin",
        txHash: "f0e1d2c3b4a5968778695a4b3c2d1e0f0123456789abcdef0123456789abcdef",
        blockNumber: 849990,
        timestamp: new Date(btcBaseTime - 3600 * 1000),
        from: [suspectBtc, "bc1qcoowner22222222222222222222222222222222"],
        to: [suspectBtc],
        asset: "BTC",
        amount: "2500000000",
        formattedAmount: "25.00000000 BTC",
        status: "confirmed",
        inputs: [
          { txHash: "init-fund-1", outputIndex: 0, address: suspectBtc, amount: "1500000000" },
          { txHash: "init-fund-2", outputIndex: 1, address: "bc1qcoowner22222222222222222222222222222222", amount: "1000000000" },
        ],
        outputs: [
          { index: 0, address: suspectBtc, amount: "249990000" },
        ],
        metadata: { scenario: "hydra-flow", note: "Multi-Input Co-Spending Genesis" },
      },
      // Fan-out 1-to-8
      {
        id: "tx-btc-hydra-01",
        chain: "bitcoin",
        txHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
        blockNumber: 850000,
        timestamp: new Date(btcBaseTime),
        from: [suspectBtc],
        to: muleAddresses,
        asset: "BTC",
        amount: "2450000000",
        formattedAmount: "24.50000000 BTC",
        status: "confirmed",
        inputs: [{ txHash: "prev-tx-001", outputIndex: 0, address: suspectBtc, amount: "2500000000" }],
        outputs: muleAddresses.map((addr, idx) => ({
          index: idx,
          address: addr,
          amount: "300000000", // 3.0 BTC each
        })),
        metadata: { scenario: "hydra-flow", note: "1-to-8 Rapid Fan-Out Dispersal" },
      },
    ];

    // Mules move funds forward to aggregator
    muleAddresses.forEach((mule, idx) => {
      const hopTxHash = `b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef${idx}`;
      hydraTxs.push({
        id: `tx-btc-mule-hop-${idx}`,
        chain: "bitcoin",
        txHash: hopTxHash,
        blockNumber: 850005 + idx,
        timestamp: new Date(btcBaseTime + (idx + 1) * 3 * 60 * 1000),
        from: [mule],
        to: [aggregatorBtc],
        asset: "BTC",
        amount: "298000000",
        formattedAmount: "2.98000000 BTC",
        status: "confirmed",
        inputs: [{ txHash: hydraTxs[1].txHash, outputIndex: idx, address: mule, amount: "300000000" }],
        outputs: [{ index: 0, address: aggregatorBtc, amount: "298000000" }],
        metadata: { scenario: "hydra-flow", note: `Mule ${idx + 1} Aggregation Fan-In` },
      });
    });

    // Final aggregator deposit to Kraken
    hydraTxs.push({
      id: "tx-btc-kraken-deposit",
      chain: "bitcoin",
      txHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef99",
      blockNumber: 850020,
      timestamp: new Date(btcBaseTime + 60 * 60 * 1000),
      from: [aggregatorBtc],
      to: [krakenDeposit],
      asset: "BTC",
      amount: "2350000000",
      formattedAmount: "23.50000000 BTC",
      status: "confirmed",
      inputs: [{ txHash: "aggregator-multi-in", outputIndex: 0, address: aggregatorBtc, amount: "2380000000" }],
      outputs: [{ index: 0, address: krakenDeposit, amount: "2350000000" }],
      metadata: { scenario: "hydra-flow", note: "Syndicate Consolidation to Kraken" },
    });

    // ==========================================
    // CASE 3: Operation Phantom Vault (ERC-20 USDT)
    // ==========================================
    const usdtBaseTime = new Date("2026-08-10T14:00:00Z").getTime();
    const phantomSuspect = "0x742d35cc6634c0532925a3b844bc454e4438f44e";
    const phantomHops = [
      "0x1111aaaa2222bbbb3333cccc4444dddd5555eeee",
      "0x2222bbbb3333cccc4444dddd5555eeee6666ffff",
      "0x3333cccc4444dddd5555eeee6666ffff7777aaaa",
      "0x4444dddd5555eeee6666ffff7777aaaa8888bbbb",
      "0x503828976d22510aad0201ac7ec8829322757974", // Coinbase Deposit
    ];

    const phantomTxs: NormalizedTransaction[] = [
      {
        id: "tx-phantom-01",
        chain: "ethereum",
        txHash: "0x9f8e7d6c5b4a3928170f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a1",
        blockNumber: 19570000,
        timestamp: new Date(usdtBaseTime),
        from: [phantomSuspect],
        to: [phantomHops[0]],
        asset: "USDT",
        amount: "500000000000",
        formattedAmount: "500,000.00 USDT",
        status: "confirmed",
        tokenTransfers: [
          {
            contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            tokenSymbol: "USDT",
            tokenName: "Tether USD",
            tokenDecimals: 6,
            from: phantomSuspect,
            to: phantomHops[0],
            amount: "500000000000",
            formattedAmount: "500,000.00 USDT",
          },
        ],
        metadata: { scenario: "phantom-vault", step: 1, note: "Initial High-Value USDT Transfer" },
      },
    ];

    for (let i = 0; i < phantomHops.length - 1; i++) {
      const fromA = phantomHops[i];
      const toB = phantomHops[i + 1];
      const amountNum = 500000 - (i + 1) * 15000;
      const rawAmt = (amountNum * 1e6).toString();
      phantomTxs.push({
        id: `tx-phantom-hop-${i + 2}`,
        chain: "ethereum",
        txHash: `0x8e7d6c5b4a3928170f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a10${i}`,
        blockNumber: 19570020 + i * 10,
        timestamp: new Date(usdtBaseTime + (i + 1) * 8 * 60 * 1000),
        from: [fromA],
        to: [toB],
        asset: "USDT",
        amount: rawAmt,
        formattedAmount: `${amountNum.toLocaleString()}.00 USDT`,
        status: "confirmed",
        tokenTransfers: [
          {
            contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            tokenSymbol: "USDT",
            tokenName: "Tether USD",
            tokenDecimals: 6,
            from: fromA,
            to: toB,
            amount: rawAmt,
            formattedAmount: `${amountNum.toLocaleString()}.00 USDT`,
          },
        ],
        metadata: { scenario: "phantom-vault", step: i + 2, note: `Rapid Hop ${i + 2}` },
      });
    }

    this.transactions = [...silkTxs, ...hydraTxs, ...phantomTxs];

    for (const tx of this.transactions) {
      this.txMap.set(tx.txHash.toLowerCase(), tx);
      const addresses = new Set<string>();
      tx.from.forEach((a) => addresses.add(a.toLowerCase()));
      tx.to.forEach((a) => addresses.add(a.toLowerCase()));
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach((t) => {
          addresses.add(t.from.toLowerCase());
          addresses.add(t.to.toLowerCase());
        });
      }
      for (const addr of addresses) {
        const list = this.addressMap.get(addr) || [];
        if (!list.includes(tx.txHash.toLowerCase())) {
          list.push(tx.txHash.toLowerCase());
          this.addressMap.set(addr, list);
        }
      }
    }
  }

  validateAddress(address: string): boolean {
    // ETH-style address (0x + 40 hex) OR arbitrary synthetic address >= 26 chars but NOT a tx hash
    if (/^0x[a-fA-F0-9]{40}$/.test(address?.trim?.())) return true;
    return !!address && address.length >= 26 && address.length < 64;
  }

  validateTxHash(txHash: string): boolean {
    // ETH-style tx hash (0x + 64 hex) OR bare 64-char hex
    if (/^0x[a-fA-F0-9]{64}$/.test(txHash?.trim?.())) return true;
    if (/^[a-fA-F0-9]{64}$/.test(txHash?.trim?.())) return true;
    return false;
  }

  async getTransaction(txHash: string): Promise<NormalizedTransaction | null> {
    return this.txMap.get(txHash.toLowerCase()) || null;
  }

  async getAddressTransactions(
    address: string,
    options?: PaginationOptions
  ): Promise<NormalizedTransaction[]> {
    const lower = address.toLowerCase();
    let hashes = this.addressMap.get(lower) || [];

    // If an unknown address is queried in demo/offline mode, dynamically synthesize a realistic multi-hop forensic path
    if (hashes.length === 0 && this.validateAddress(address)) {
      this.synthesizeDynamicCaseForAddress(address);
      hashes = this.addressMap.get(lower) || [];
    }

    let list = hashes
      .map((h) => this.txMap.get(h))
      .filter((t): t is NormalizedTransaction => !!t);

    if (options?.direction === "inbound") {
      list = list.filter((tx) =>
        tx.to.some((t) => t.toLowerCase() === lower) ||
        tx.tokenTransfers?.some((tt) => tt.to.toLowerCase() === lower)
      );
    } else if (options?.direction === "outbound") {
      list = list.filter((tx) =>
        tx.from.some((f) => f.toLowerCase() === lower) ||
        tx.tokenTransfers?.some((tt) => tt.from.toLowerCase() === lower)
      );
    }

    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return list.slice(offset, offset + limit);
  }

  async getBalance(address: string): Promise<AddressBalance> {
    const txs = await this.getAddressTransactions(address);
    return {
      address,
      chain: this.chain,
      asset: this.chain === "bitcoin" ? "BTC" : "ETH",
      balance: "12.5000",
      formattedBalance: this.chain === "bitcoin" ? "12.5000 BTC" : "12.5000 ETH",
      txCount: txs.length,
    };
  }

  private synthesizeDynamicCaseForAddress(address: string): void {
    const isEth = address.startsWith("0x");
    const baseTime = Date.now() - 4 * 3600 * 1000;
    const isBtc = !isEth;

    // Generate dynamic multi-hop chain: Target -> Intermediate 1 -> Mixer / Aggregator -> Intermediate 2 -> Exchange
    const hop1 = isEth ? `0x${address.slice(2, 10)}11111111111111111111111111111111` : `bc1qhop1${address.slice(7, 15)}11111111111111111111111111`;
    const hop2 = isEth ? `0x${address.slice(2, 10)}22222222222222222222222222222222` : `bc1qhop2${address.slice(7, 15)}22222222222222222222222222`;
    const mixerOrBridge = isEth
      ? "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b" // Tornado Cash
      : "bc1qaggregator999999999999999999999999999";
    const hop3 = isEth ? `0x${address.slice(2, 10)}33333333333333333333333333333333` : `bc1qhop3${address.slice(7, 15)}33333333333333333333333333`;
    const exchange = isEth
      ? "0x28c6c06298d514db089934071355e5743bf21d60" // Binance
      : "bc1qkraken00000000000000000000000000000000"; // Kraken

    const asset = isEth ? "ETH" : "BTC";
    const amountVal = isEth ? "85.50" : "14.25";

    const dynamicTxs: NormalizedTransaction[] = [
      {
        id: `tx-dyn-${address.slice(0, 8)}-1`,
        chain: isEth ? "ethereum" : "bitcoin",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime),
        from: [address],
        to: [hop1],
        asset,
        amount: isEth ? "85500000000000000000" : "1425000000",
        formattedAmount: `${amountVal} ${asset}`,
        status: "confirmed",
        metadata: { dynamic: true, step: 1, note: "Initial Outflow" },
      },
      {
        id: `tx-dyn-${address.slice(0, 8)}-2`,
        chain: isEth ? "ethereum" : "bitcoin",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 15 * 60 * 1000),
        from: [hop1],
        to: [hop2],
        asset,
        amount: isEth ? "80000000000000000000" : "1350000000",
        formattedAmount: isEth ? "80.00 ETH" : "13.50 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 2, note: "Peel Chain Intermediary" },
      },
      {
        id: `tx-dyn-${address.slice(0, 8)}-3`,
        chain: isEth ? "ethereum" : "bitcoin",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 35 * 60 * 1000),
        from: [hop2],
        to: [mixerOrBridge],
        asset,
        amount: isEth ? "78000000000000000000" : "1300000000",
        formattedAmount: isEth ? "78.00 ETH" : "13.00 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 3, note: isEth ? "Mixer Deposit" : "Aggregation Node" },
      },
      {
        id: `tx-dyn-${address.slice(0, 8)}-4`,
        chain: isEth ? "ethereum" : "bitcoin",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 120 * 60 * 1000),
        from: [mixerOrBridge],
        to: [hop3],
        asset,
        amount: isEth ? "76000000000000000000" : "1280000000",
        formattedAmount: isEth ? "76.00 ETH" : "12.80 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 4, note: "Post-Mixer Withdrawal Hop" },
      },
      {
        id: `tx-dyn-${address.slice(0, 8)}-5`,
        chain: isEth ? "ethereum" : "bitcoin",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 180 * 60 * 1000),
        from: [hop3],
        to: [exchange],
        asset,
        amount: isEth ? "75000000000000000000" : "1250000000",
        formattedAmount: isEth ? "75.00 ETH" : "12.50 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 5, note: "Cashout Deposit to Exchange" },
      },
    ];

    for (const tx of dynamicTxs) {
      this.transactions.push(tx);
      this.txMap.set(tx.txHash.toLowerCase(), tx);
      const addresses = new Set<string>();
      tx.from.forEach((a) => addresses.add(a.toLowerCase()));
      tx.to.forEach((a) => addresses.add(a.toLowerCase()));
      for (const addr of addresses) {
        const list = this.addressMap.get(addr) || [];
        if (!list.includes(tx.txHash.toLowerCase())) {
          list.push(tx.txHash.toLowerCase());
          this.addressMap.set(addr, list);
        }
      }
    }
  }

  getAllSyntheticTransactions(): NormalizedTransaction[] {
    return this.transactions;
  }
}
