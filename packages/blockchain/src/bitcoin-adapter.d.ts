import { NormalizedTransaction, PaginationOptions, AddressBalance, UTXOInput, UTXOOutput } from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";
export declare class BitcoinAdapter extends BaseBlockchainAdapter {
    readonly chain = "bitcoin";
    private txStore;
    private addressTxMap;
    private addressBalances;
    constructor(seedTransactions?: NormalizedTransaction[]);
    validateAddress(address: string): boolean;
    validateTxHash(txHash: string): boolean;
    seedData(transactions: NormalizedTransaction[]): void;
    setMockBalance(address: string, balance: AddressBalance): void;
    getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
    getAddressTransactions(address: string, options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    getBalance(address: string): Promise<AddressBalance>;
    static createBitcoinTransaction(params: {
        txHash: string;
        timestamp: Date;
        inputs: UTXOInput[];
        outputs: UTXOOutput[];
        feeSats?: number;
        blockNumber?: number;
        metadata?: Record<string, unknown>;
    }): NormalizedTransaction;
    private synthesizeDynamicBtcTxs;
}
//# sourceMappingURL=bitcoin-adapter.d.ts.map