import {
  NormalizedTransaction,
  PaginationOptions,
  AddressBalance,
  UTXOInput,
  UTXOOutput,
} from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";

export class BitcoinAdapter extends BaseBlockchainAdapter {
  readonly chain = "bitcoin";
  private txStore: Map<string, NormalizedTransaction> = new Map();
  private addressTxMap: Map<string, string[]> = new Map();
  private addressBalances: Map<string, AddressBalance> = new Map();

  constructor(seedTransactions?: NormalizedTransaction[]) {
    super();
    if (seedTransactions) {
      this.seedData(seedTransactions);
    }
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== "string") return false;
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/i;
    return btcRegex.test(address.trim());
  }

  validateTxHash(txHash: string): boolean {
    if (!txHash || typeof txHash !== "string") return false;
    return /^[a-fA-F0-9]{64}$/.test(txHash.trim());
  }

  seedData(transactions: NormalizedTransaction[]): void {
    for (const tx of transactions) {
      this.txStore.set(tx.txHash.toLowerCase(), tx);
      for (const fromAddr of tx.from) {
        const lower = fromAddr.toLowerCase();
        const list = this.addressTxMap.get(lower) || [];
        if (!list.includes(tx.txHash.toLowerCase())) {
          list.push(tx.txHash.toLowerCase());
          this.addressTxMap.set(lower, list);
        }
      }
      for (const toAddr of tx.to) {
        const lower = toAddr.toLowerCase();
        const list = this.addressTxMap.get(lower) || [];
        if (!list.includes(tx.txHash.toLowerCase())) {
          list.push(tx.txHash.toLowerCase());
          this.addressTxMap.set(lower, list);
        }
      }
    }
  }

  setMockBalance(address: string, balance: AddressBalance): void {
    this.addressBalances.set(address.toLowerCase(), balance);
  }

  async getTransaction(txHash: string): Promise<NormalizedTransaction | null> {
    const tx = this.txStore.get(txHash.toLowerCase());
    return tx || null;
  }

  async getAddressTransactions(
    address: string,
    options?: PaginationOptions
  ): Promise<NormalizedTransaction[]> {
    const lower = address.toLowerCase();
    let hashes = this.addressTxMap.get(lower) || [];

    // Attempt live Bitcoin Mainnet query via Blockstream API if not in local store
    if (hashes.length === 0 && this.validateAddress(address)) {
      try {
        const res = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        if (res.ok) {
          const data: any[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const liveTxs: NormalizedTransaction[] = data.slice(0, 20).map((tx: any) => {
              const inputs: UTXOInput[] = (tx.vin || []).map((vin: any) => ({
                txHash: vin.txid,
                outputIndex: vin.vout,
                address: vin.prevout?.scriptpubkey_address || "unknown",
                amount: (vin.prevout?.value || 0).toString(),
              }));
              const outputs: UTXOOutput[] = (tx.vout || []).map((vout: any, idx: number) => ({
                index: idx,
                address: vout.scriptpubkey_address || "unknown",
                amount: (vout.value || 0).toString(),
              }));
              const from = Array.from(new Set(inputs.map((i) => i.address)));
              const to = Array.from(new Set(outputs.map((o) => o.address)));
              const totalOut = outputs.reduce((acc, o) => acc + BigInt(o.amount || "0"), 0n);
              return {
                id: `btc-${tx.txid}`,
                chain: "bitcoin",
                txHash: tx.txid,
                blockNumber: tx.status?.block_height,
                timestamp: new Date((tx.status?.block_time || Date.now() / 1000) * 1000),
                from,
                to,
                asset: "BTC",
                amount: totalOut.toString(),
                formattedAmount: `${(Number(totalOut) / 1e8).toFixed(8)} BTC`,
                fee: tx.fee ? `${(tx.fee / 1e8).toFixed(8)} BTC` : undefined,
                status: "confirmed",
                inputs,
                outputs,
                isContractCall: false,
                metadata: { source: "bitcoin_mainnet_live" },
              };
            });
            this.seedData(liveTxs);
          }
        }
      } catch {}

      // We no longer automatically synthesize data for unknown real addresses
      // to avoid confusing users with hallucinated transactions.
    }

    let transactions = hashes
      .map((h) => this.txStore.get(h))
      .filter((tx): tx is NormalizedTransaction => !!tx);

    if (options?.direction === "inbound") {
      transactions = transactions.filter((tx) =>
        tx.to.some((t) => t.toLowerCase() === lower)
      );
    } else if (options?.direction === "outbound") {
      transactions = transactions.filter((tx) =>
        tx.from.some((f) => f.toLowerCase() === lower)
      );
    }

    if (options?.startTime) {
      transactions = transactions.filter((tx) => tx.timestamp >= options.startTime!);
    }
    if (options?.endTime) {
      transactions = transactions.filter((tx) => tx.timestamp <= options.endTime!);
    }

    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return transactions.slice(offset, offset + limit);
  }

  async getBalance(address: string): Promise<AddressBalance> {
    const lower = address.toLowerCase();
    const stored = this.addressBalances.get(lower);
    if (stored) return stored;

    const txs = await this.getAddressTransactions(address);
    let totalReceived = 0;
    let totalSent = 0;

    for (const tx of txs) {
      const isSender = tx.from.some((f) => f.toLowerCase() === lower);
      const isReceiver = tx.to.some((t) => t.toLowerCase() === lower);
      const val = parseFloat(tx.formattedAmount || tx.amount) || 0;
      if (isReceiver) totalReceived += val;
      if (isSender) totalSent += val;
    }

    const currentBalance = Math.max(0, totalReceived - totalSent);
    return {
      address,
      chain: this.chain,
      asset: "BTC",
      balance: currentBalance.toFixed(8),
      formattedBalance: `${currentBalance.toFixed(8)} BTC`,
      totalReceived: totalReceived.toFixed(8),
      totalSent: totalSent.toFixed(8),
      txCount: txs.length,
    };
  }

  static createBitcoinTransaction(params: {
    txHash: string;
    timestamp: Date;
    inputs: UTXOInput[];
    outputs: UTXOOutput[];
    feeSats?: number;
    blockNumber?: number;
    metadata?: Record<string, unknown>;
  }): NormalizedTransaction {
    const fromAddresses = Array.from(new Set(params.inputs.map((i) => i.address)));
    const toAddresses = Array.from(new Set(params.outputs.map((o) => o.address)));
    const totalOutSat = params.outputs.reduce((acc, o) => acc + BigInt(o.amount), 0n);
    const amountBtc = (Number(totalOutSat) / 1e8).toFixed(8);

    return {
      id: `btc-${params.txHash}`,
      chain: "bitcoin",
      txHash: params.txHash,
      blockNumber: params.blockNumber,
      timestamp: params.timestamp,
      from: fromAddresses,
      to: toAddresses,
      asset: "BTC",
      amount: totalOutSat.toString(),
      formattedAmount: `${amountBtc} BTC`,
      fee: params.feeSats ? `${(params.feeSats / 1e8).toFixed(8)} BTC` : undefined,
      status: "confirmed",
      inputs: params.inputs,
      outputs: params.outputs,
      isContractCall: false,
      metadata: params.metadata,
    };
  }

  private synthesizeDynamicBtcTxs(address: string): void {
    const baseTime = Date.now() - 4 * 3600 * 1000;
    const hop1 = `bc1qhop1${address.slice(7, 15)}11111111111111111111111111`;
    const hop2 = `bc1qhop2${address.slice(7, 15)}22222222222222222222222222`;
    const aggregator = "bc1qaggregator999999999999999999999999999";
    const kraken = "bc1qkraken00000000000000000000000000000000";

    const dynamicTxs: NormalizedTransaction[] = [
      {
        id: `tx-dyn-btc-${address.slice(0, 8)}-1`,
        chain: "bitcoin",
        txHash: `a${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
        timestamp: new Date(baseTime),
        from: [address],
        to: [hop1],
        asset: "BTC",
        amount: "1425000000",
        formattedAmount: "14.25 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 1, note: "Initial Target Outflow" },
      },
      {
        id: `tx-dyn-btc-${address.slice(0, 8)}-2`,
        chain: "bitcoin",
        txHash: `b${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
        timestamp: new Date(baseTime + 20 * 60 * 1000),
        from: [hop1],
        to: [hop2],
        asset: "BTC",
        amount: "1350000000",
        formattedAmount: "13.50 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 2, note: "Peel Chain Intermediary" },
      },
      {
        id: `tx-dyn-btc-${address.slice(0, 8)}-3`,
        chain: "bitcoin",
        txHash: `c${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
        timestamp: new Date(baseTime + 45 * 60 * 1000),
        from: [hop2],
        to: [aggregator],
        asset: "BTC",
        amount: "1300000000",
        formattedAmount: "13.00 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 3, note: "Syndicate Aggregator" },
      },
      {
        id: `tx-dyn-btc-${address.slice(0, 8)}-4`,
        chain: "bitcoin",
        txHash: `d${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
        timestamp: new Date(baseTime + 120 * 60 * 1000),
        from: [aggregator],
        to: [kraken],
        asset: "BTC",
        amount: "1250000000",
        formattedAmount: "12.50 BTC",
        status: "confirmed",
        metadata: { dynamic: true, step: 4, note: "Cashout Deposit to Kraken" },
      },
    ];

    this.seedData(dynamicTxs);
  }
}
