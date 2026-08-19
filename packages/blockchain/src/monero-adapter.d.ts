import { NormalizedTransaction, PaginationOptions, AddressBalance } from "@crypto-tracer/types";
import { BaseBlockchainAdapter } from "./base-adapter";
export declare class MoneroAdapter extends BaseBlockchainAdapter {
    readonly chain = "monero";
    validateAddress(address: string): boolean;
    validateTxHash(txHash: string): boolean;
    getTransaction(_txHash: string): Promise<NormalizedTransaction | null>;
    getAddressTransactions(_address: string, _options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    getBalance(address: string): Promise<AddressBalance>;
    getTraceabilityStatus(): {
        traceability: "LIMITED";
        reason: "PRIVACY_MECHANISM";
        details: string;
    };
}
//# sourceMappingURL=monero-adapter.d.ts.map