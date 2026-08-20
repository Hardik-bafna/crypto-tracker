import { NormalizedTransaction } from "@crypto-tracer/types";
export interface TemporalCluster {
    addresses: string[];
    coActivityCount: number;
    confidence: number;
}
export declare function detectTemporalCoActivity(transactions: NormalizedTransaction[], timeWindowSeconds?: number): TemporalCluster[];
//# sourceMappingURL=temporal.d.ts.map