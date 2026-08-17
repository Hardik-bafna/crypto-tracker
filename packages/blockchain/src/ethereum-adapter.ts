import {
  NormalizedTransaction,
  PaginationOptions,
  AddressBalance,
  TokenTransfer,
} from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";

export class EthereumAdapter extends BaseBlockchainAdapter {
  readonly chain = "ethereum";
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
    return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  }

  validateTxHash(txHash: string): boolean {
    if (!txHash || typeof txHash !== "string") return false;
    return /^0x[a-fA-F0-9]{64}$/.test(txHash.trim());
  }

  seedData(transactions: NormalizedTransaction[]): void {
    for (const tx of transactions) {
      this.txStore.set(tx.txHash.toLowerCase(), tx);
      const allAddresses = new Set<string>();
      tx.from.forEach((a) => allAddresses.add(a.toLowerCase()));
      tx.to.forEach((a) => allAddresses.add(a.toLowerCase()));
      if (tx.tokenTransfers) {
        tx.tokenTransfers.forEach((t) => {
          allAddresses.add(t.from.toLowerCase());
          allAddresses.add(t.to.toLowerCase());
        });
      }

      for (const addr of allAddresses) {
        const list = this.addressTxMap.get(addr) || [];
        if (!list.includes(tx.txHash.toLowerCase())) {
          list.push(tx.txHash.toLowerCase());
          this.addressTxMap.set(addr, list);
        }
      }
    }
  }

  async getTransaction(txHash: string): Promise<NormalizedTransaction | null> {
    return this.txStore.get(txHash.toLowerCase()) || null;
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
      transactions = transactions.filter((tx) => {
        const directInbound = tx.to.some((t) => t.toLowerCase() === lower);
        const tokenInbound = tx.tokenTransfers?.some(
          (t) => t.to.toLowerCase() === lower
        );
        return directInbound || tokenInbound;
      });
    } else if (options?.direction === "outbound") {
      transactions = transactions.filter((tx) => {
        const directOutbound = tx.from.some((f) => f.toLowerCase() === lower);
        const tokenOutbound = tx.tokenTransfers?.some(
          (t) => t.from.toLowerCase() === lower
        );
        return directOutbound || tokenOutbound;
      });
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

  async getTokenTransfers(
    address: string,
    options?: PaginationOptions
  ): Promise<TokenTransfer[]> {
    const txs = await this.getAddressTransactions(address, options);
    const transfers: TokenTransfer[] = [];
    const lower = address.toLowerCase();

    for (const tx of txs) {
      if (tx.tokenTransfers) {
        for (const tt of tx.tokenTransfers) {
          if (
            tt.from.toLowerCase() === lower ||
            tt.to.toLowerCase() === lower
          ) {
            transfers.push(tt);
          }
        }
      }
    }
    return transfers;
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
      asset: "ETH",
      balance: currentBalance.toFixed(4),
      formattedBalance: `${currentBalance.toFixed(4)} ETH`,
      totalReceived: totalReceived.toFixed(4),
      totalSent: totalSent.toFixed(4),
      txCount: txs.length,
    };
  }

  static createEthTransaction(params: {
    txHash: string;
    from: string;
    to: string;
    amountWei: bigint | string;
    timestamp: Date;
    blockNumber?: number;
    gasUsed?: number;
    gasPriceGwei?: number;
    tokenTransfers?: TokenTransfer[];
    isContractCall?: boolean;
    contractAddress?: string;
    metadata?: Record<string, unknown>;
  }): NormalizedTransaction {
    const weiStr = params.amountWei.toString();
    const ethVal = (Number(BigInt(weiStr) / 10000000000n) / 1e8).toFixed(4);

    return {
      id: `eth-${params.txHash}`,
      chain: "ethereum",
      txHash: params.txHash,
      blockNumber: params.blockNumber,
      timestamp: params.timestamp,
      from: [params.from],
      to: [params.to],
      asset: "ETH",
      amount: weiStr,
      formattedAmount: `${ethVal} ETH`,
      fee: params.gasUsed && params.gasPriceGwei
        ? `${((params.gasUsed * params.gasPriceGwei) / 1e9).toFixed(6)} ETH`
        : undefined,
      status: "confirmed",
      tokenTransfers: params.tokenTransfers,
      isContractCall: params.isContractCall ?? false,
      contractAddress: params.contractAddress,
      metadata: params.metadata,
    };
  }
}
