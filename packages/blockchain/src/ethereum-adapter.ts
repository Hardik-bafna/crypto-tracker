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
    const lower = txHash.toLowerCase();
    let tx = this.txStore.get(lower);
    
    if (!tx && this.validateTxHash(txHash)) {
      try {
        console.log(`[EthereumAdapter] Fetching tx from Blockscout: ${txHash}`);
        const res = await fetch(`https://eth.blockscout.com/api/v2/transactions/${txHash}`);
        console.log(`[EthereumAdapter] Blockscout response status: ${res.status}`);
        if (res.ok) {
          const data: any = await res.json();
          console.log(`[EthereumAdapter] tx hash from response: ${data?.hash}, from: ${data?.from?.hash}, to: ${data?.to?.hash}`);
          if (data && data.hash) {
            const wei = data.value || "0";
            let ethVal = "0.0000";
            try {
              ethVal = (Number(BigInt(wei) / 10000000000n) / 1e8).toFixed(4);
            } catch {}
            
            const tokenTransfers: TokenTransfer[] = (data.token_transfers || []).map((tt: any) => {
              const tokenSymbol = tt.token?.symbol || "ERC20";
              const tokenDecimals = tt.token?.decimals ? parseInt(tt.token.decimals) : 18;
              let formattedAmount = "0";
              try {
                const val = tt.total?.value || "0";
                formattedAmount = (Number(BigInt(val)) / Math.pow(10, tokenDecimals)).toFixed(4);
              } catch {}
              
              return {
                tokenAddress: tt.token?.address || "0x0",
                symbol: tokenSymbol,
                amount: tt.total?.value || "0",
                formattedAmount,
                from: tt.from?.hash || data.from?.hash,
                to: tt.to?.hash || data.to?.hash || "0x0000000000000000000000000000000000000000",
              };
            });

            tx = {
              id: `eth-${data.hash}`,
              chain: "ethereum",
              txHash: data.hash,
              blockNumber: data.block_number,
              timestamp: new Date(data.timestamp || Date.now()),
              from: [data.from?.hash],
              to: [data.to?.hash || "0x0000000000000000000000000000000000000000"],
              asset: "ETH",
              amount: wei,
              formattedAmount: `${ethVal} ETH`,
              status: "confirmed",
              isContractCall: !!data.to?.is_contract,
              tokenTransfers: tokenTransfers.length > 0 ? tokenTransfers : undefined,
              metadata: { source: "mainnet_live" },
            };
            this.seedData([tx]);
          }
        }
      } catch (e: any) {
        console.error(`[EthereumAdapter] getTransaction failed: ${e?.message}`);
      }
    }
    
    return tx || null;
  }

  async getAddressTransactions(
    address: string,
    options?: PaginationOptions
  ): Promise<NormalizedTransaction[]> {
    const lower = address.toLowerCase();
    let hashes = this.addressTxMap.get(lower) || [];

    // Attempt live Ethereum Mainnet indexer fetch if not in local store
    if (hashes.length === 0 && this.validateAddress(address)) {
      const liveTxs = await this.fetchLiveAddressTransactions(address);
      if (liveTxs.length > 0) {
        this.seedData(liveTxs);
      }
    }

    // Re-read hashes after potential live fetch
    hashes = this.addressTxMap.get(lower) || [];
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

  private synthesizeDynamicEthTxs(address: string): void {
    const baseTime = Date.now() - 4 * 3600 * 1000;
    const hop1 = `0x${address.slice(2, 10)}11111111111111111111111111111111`;
    const hop2 = `0x${address.slice(2, 10)}22222222222222222222222222222222`;
    const tornadoCash = "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b";
    const hop3 = `0x${address.slice(2, 10)}33333333333333333333333333333333`;
    const binance = "0x28c6c06298d514db089934071355e5743bf21d60";

    const dynamicTxs: NormalizedTransaction[] = [
      {
        id: `tx-dyn-eth-${address.slice(0, 8)}-1`,
        chain: "ethereum",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime),
        from: [address],
        to: [hop1],
        asset: "ETH",
        amount: "85500000000000000000",
        formattedAmount: "85.50 ETH",
        status: "confirmed",
        metadata: { dynamic: true, step: 1, note: "Initial Target Outflow" },
      },
      {
        id: `tx-dyn-eth-${address.slice(0, 8)}-2`,
        chain: "ethereum",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 12 * 60 * 1000),
        from: [hop1],
        to: [hop2],
        asset: "ETH",
        amount: "80000000000000000000",
        formattedAmount: "80.00 ETH",
        status: "confirmed",
        metadata: { dynamic: true, step: 2, note: "Peel Chain Intermediary" },
      },
      {
        id: `tx-dyn-eth-${address.slice(0, 8)}-3`,
        chain: "ethereum",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 30 * 60 * 1000),
        from: [hop2],
        to: [tornadoCash],
        asset: "ETH",
        amount: "78000000000000000000",
        formattedAmount: "78.00 ETH",
        status: "confirmed",
        isContractCall: true,
        contractAddress: tornadoCash,
        metadata: { dynamic: true, step: 3, note: "Mixer Deposit" },
      },
      {
        id: `tx-dyn-eth-${address.slice(0, 8)}-4`,
        chain: "ethereum",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 90 * 60 * 1000),
        from: [tornadoCash],
        to: [hop3],
        asset: "ETH",
        amount: "76000000000000000000",
        formattedAmount: "76.00 ETH",
        status: "confirmed",
        metadata: { dynamic: true, step: 4, note: "Mixer Withdrawal Hop" },
      },
      {
        id: `tx-dyn-eth-${address.slice(0, 8)}-5`,
        chain: "ethereum",
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(66, "0"),
        timestamp: new Date(baseTime + 150 * 60 * 1000),
        from: [hop3],
        to: [binance],
        asset: "ETH",
        amount: "75000000000000000000",
        formattedAmount: "75.00 ETH",
        status: "confirmed",
        metadata: { dynamic: true, step: 5, note: "Cashout Deposit to Binance" },
      },
    ];

    this.seedData(dynamicTxs);
  }

  private async fetchLiveAddressTransactions(address: string): Promise<NormalizedTransaction[]> {
    const liveTxs: NormalizedTransaction[] = [];
    const lower = address.toLowerCase();

    try {
      // 1. Fetch main native transactions up to 3 pages using next_page_params pagination
      let url: string | null = `https://eth.blockscout.com/api/v2/addresses/${address}/transactions`;
      let pageCount = 0;
      const MAX_PAGES = 3;

      while (url && pageCount < MAX_PAGES) {
        pageCount++;
        const res = await fetch(url);
        if (!res.ok) break;
        const data: any = await res.json();
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) break;

        for (const tx of data.items) {
          const wei = tx.value || "0";
          let ethVal = "0.0000";
          try {
            ethVal = (Number(BigInt(wei) / 10000000000n) / 1e8).toFixed(4);
          } catch {}

          const tokenTransfers: TokenTransfer[] = (tx.token_transfers || []).map((tt: any) => {
            const tokenSymbol = tt.token?.symbol || "ERC20";
            const tokenDecimals = tt.token?.decimals ? parseInt(tt.token.decimals) : 18;
            let formattedAmount = "0";
            try {
              const val = tt.total?.value || "0";
              formattedAmount = (Number(BigInt(val)) / Math.pow(10, tokenDecimals)).toFixed(4);
            } catch {}

            return {
              tokenAddress: tt.token?.address || "0x0",
              symbol: tokenSymbol,
              amount: tt.total?.value || "0",
              formattedAmount,
              from: tt.from?.hash || address,
              to: tt.to?.hash || "0x0000000000000000000000000000000000000000",
            };
          });

          // Asset and amount formatting: prioritize token symbol/amount if native ETH is 0
          let asset = "ETH";
          let formattedAmount = `${ethVal} ETH`;
          if ((ethVal === "0.0000" || wei === "0") && tokenTransfers.length > 0) {
            asset = tokenTransfers[0].tokenSymbol;
            formattedAmount = `${tokenTransfers[0].formattedAmount} ${tokenTransfers[0].tokenSymbol}`;
          }

          liveTxs.push({
            id: `eth-${tx.hash}`,
            chain: "ethereum",
            txHash: tx.hash,
            blockNumber: tx.block_number,
            timestamp: new Date(tx.timestamp || Date.now()),
            from: [tx.from?.hash || address],
            to: [tx.to?.hash || "0x0000000000000000000000000000000000000000"],
            asset,
            amount: wei,
            formattedAmount,
            status: "confirmed",
            isContractCall: !!tx.to?.is_contract,
            tokenTransfers: tokenTransfers.length > 0 ? tokenTransfers : undefined,
            metadata: { source: "mainnet_live" },
          });
        }

        // Build next page URL using Blockscout next_page_params if available
        if (data.next_page_params && typeof data.next_page_params === "object") {
          const params = new URLSearchParams(data.next_page_params as Record<string, string>).toString();
          url = `https://eth.blockscout.com/api/v2/addresses/${address}/transactions?${params}`;
        } else {
          url = null;
        }
      }

      // 2. Fetch dedicated Token Transfers endpoint to capture ERC-20 token transfers
      try {
        const tokenRes = await fetch(`https://eth.blockscout.com/api/v2/addresses/${address}/token-transfers`);
        if (tokenRes.ok) {
          const tokenData: any = await tokenRes.json();
          if (tokenData.items && Array.isArray(tokenData.items)) {
            for (const item of tokenData.items) {
              const txHash = item.tx_hash || item.transaction_hash;
              if (!txHash) continue;
              if (liveTxs.some((t) => t.txHash.toLowerCase() === txHash.toLowerCase())) continue;

              const tokenSymbol = item.token?.symbol || "ERC20";
              const tokenDecimals = item.token?.decimals ? parseInt(item.token.decimals) : 18;
              let formattedAmt = "0";
              try {
                const val = item.total?.value || "0";
                formattedAmt = (Number(BigInt(val)) / Math.pow(10, tokenDecimals)).toFixed(4);
              } catch {}

              const tt: TokenTransfer = {
                contractAddress: item.token?.address || "0x0",
                tokenSymbol,
                tokenDecimals,
                amount: item.total?.value || "0",
                formattedAmount: formattedAmt,
                from: item.from?.hash || address,
                to: item.to?.hash || "0x0000000000000000000000000000000000000000",
              };

              liveTxs.push({
                id: `eth-token-${txHash}`,
                chain: "ethereum",
                txHash,
                blockNumber: item.block_number,
                timestamp: new Date(item.timestamp || Date.now()),
                from: [item.from?.hash || address],
                to: [item.to?.hash || "0x0000000000000000000000000000000000000000"],
                asset: tokenSymbol,
                amount: item.total?.value || "0",
                formattedAmount: `${formattedAmt} ${tokenSymbol}`,
                status: "confirmed",
                isContractCall: true,
                tokenTransfers: [tt],
                metadata: { source: "mainnet_live_token" },
              });
            }
          }
        }
      } catch {}
    } catch (e: any) {
      console.error(`[EthereumAdapter] Live fetch error for ${address}: ${e?.message}`);
    }

    return liveTxs;
  }
}
