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
    // Legacy (P2PKH): starts with 1, 26-35 base58 chars
    // P2SH: starts with 3, 26-35 base58 chars
    // Native SegWit (Bech32): starts with bc1q or bc1p (Taproot)
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
    const hashes = this.addressTxMap.get(lower) || [];
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

  /**
   * Helper to construct normalized Bitcoin transactions preserving UTXO semantics
   */
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
}
