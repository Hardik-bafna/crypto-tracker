import { NormalizedTransaction, TokenTransfer } from "@crypto-tracer/types";
export declare const KNOWN_TOKENS: Record<string, {
    symbol: string;
    name: string;
    decimals: number;
}>;
export declare class ERC20Adapter {
    static parseTransfer(params: {
        contractAddress: string;
        from: string;
        to: string;
        rawAmount: string | bigint;
        txHash: string;
        timestamp: Date;
    }): TokenTransfer;
    static createTokenTransaction(params: {
        txHash: string;
        from: string;
        to: string;
        contractAddress: string;
        rawAmount: string | bigint;
        timestamp: Date;
        blockNumber?: number;
        feeEth?: string;
    }): NormalizedTransaction;
}
//# sourceMappingURL=erc20-adapter.d.ts.map