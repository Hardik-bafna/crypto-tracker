import { NormalizedTransaction, BlockchainAdapter } from "@crypto-tracer/types";
import { TransactionGraph } from "./graph-model";
export declare class GraphBuilder {
    /**
     * Builds a TransactionGraph from a set of normalized transactions
     */
    static buildFromTransactions(transactions: NormalizedTransaction[], targetAddressOrTx?: string): TransactionGraph;
    /**
     * Ingests from blockchain adapter recursively up to maxHops
     */
    static ingestAndBuild(adapter: BlockchainAdapter, startAddress: string, maxHops?: number, direction?: "forward" | "backward" | "both"): Promise<TransactionGraph>;
}
//# sourceMappingURL=graph-builder.d.ts.map