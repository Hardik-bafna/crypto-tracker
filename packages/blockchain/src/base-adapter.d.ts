import { BlockchainAdapter, NormalizedTransaction, PaginationOptions, AddressBalance } from "@crypto-tracer/types";
export declare abstract class BaseBlockchainAdapter implements BlockchainAdapter {
    abstract readonly chain: string;
    abstract validateAddress(address: string): boolean;
    abstract validateTxHash(txHash: string): boolean;
    abstract getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
    abstract getAddressTransactions(address: string, options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    abstract getBalance(address: string): Promise<AddressBalance>;
    protected formatUnits(amountBig: bigint | string | number, decimals: number): string;
    getTraceabilityStatus(): {
        traceability: "FULL" | "LIMITED" | "UNSUPPORTED";
        reason?: string;
    };
}
//# sourceMappingURL=base-adapter.d.ts.map