import { NormalizedTransaction, PaginationOptions, AddressBalance, TokenTransfer } from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";
export declare class EthereumAdapter extends BaseBlockchainAdapter {
    readonly chain = "ethereum";
    private txStore;
    private addressTxMap;
    private addressBalances;
    constructor(seedTransactions?: NormalizedTransaction[]);
    validateAddress(address: string): boolean;
    validateTxHash(txHash: string): boolean;
    seedData(transactions: NormalizedTransaction[]): void;
    getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
    getAddressTransactions(address: string, options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    getTokenTransfers(address: string, options?: PaginationOptions): Promise<TokenTransfer[]>;
    getBalance(address: string): Promise<AddressBalance>;
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
    }): NormalizedTransaction;
    private synthesizeDynamicEthTxs;
    private fetchLiveAddressTransactions;
}
//# sourceMappingURL=ethereum-adapter.d.ts.map