import { NormalizedTransaction } from "@crypto-tracer/types";
export interface ChangeAddressInference {
    senderAddress: string;
    changeAddress: string;
    txHash: string;
    confidence: number;
    reason: string;
}
export declare function detectChangeAddresses(transactions: NormalizedTransaction[]): ChangeAddressInference[];
//# sourceMappingURL=change-address.d.ts.map