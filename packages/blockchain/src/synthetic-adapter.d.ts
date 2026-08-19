import { NormalizedTransaction, PaginationOptions, AddressBalance } from "@crypto-tracer/types";
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
export declare const SYNTHETIC_DEMO_CASES: SyntheticDemoCase[];
export declare class SyntheticBlockchainAdapter extends BaseBlockchainAdapter {
    readonly chain: string;
    private transactions;
    private txMap;
    private addressMap;
    constructor(chain?: string);
    private initSyntheticData;
    validateAddress(address: string): boolean;
    validateTxHash(txHash: string): boolean;
    getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
    getAddressTransactions(address: string, options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    getBalance(address: string): Promise<AddressBalance>;
    private synthesizeDynamicCaseForAddress;
    getAllSyntheticTransactions(): NormalizedTransaction[];
}
//# sourceMappingURL=synthetic-adapter.d.ts.map