import { NormalizedTransaction } from "@crypto-tracer/types";
export interface ClusterGroup {
    addresses: Set<string>;
    txHashes: Set<string>;
    heuristic: "COMMON_INPUT_OWNERSHIP";
    confidence: number;
}
export declare function applyCommonInputHeuristic(transactions: NormalizedTransaction[]): ClusterGroup[];
//# sourceMappingURL=common-input.d.ts.map