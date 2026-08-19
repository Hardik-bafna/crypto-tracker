import { z } from "zod";
export type BlockchainType = "bitcoin" | "ethereum" | "erc20" | "monero" | "synthetic" | string;
export type TransactionStatus = "confirmed" | "pending" | "failed";
export declare const UTXOInputSchema: z.ZodObject<{
    txHash: z.ZodString;
    outputIndex: z.ZodNumber;
    address: z.ZodString;
    amount: z.ZodString;
    scriptPubKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    txHash: string;
    outputIndex: number;
    address: string;
    amount: string;
    scriptPubKey?: string | undefined;
}, {
    txHash: string;
    outputIndex: number;
    address: string;
    amount: string;
    scriptPubKey?: string | undefined;
}>;
export type UTXOInput = z.infer<typeof UTXOInputSchema>;
export declare const UTXOOutputSchema: z.ZodObject<{
    index: z.ZodNumber;
    address: z.ZodString;
    amount: z.ZodString;
    scriptPubKey: z.ZodOptional<z.ZodString>;
    isChange: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    address: string;
    amount: string;
    index: number;
    scriptPubKey?: string | undefined;
    isChange?: boolean | undefined;
}, {
    address: string;
    amount: string;
    index: number;
    scriptPubKey?: string | undefined;
    isChange?: boolean | undefined;
}>;
export type UTXOOutput = z.infer<typeof UTXOOutputSchema>;
export declare const TokenTransferSchema: z.ZodObject<{
    contractAddress: z.ZodString;
    tokenSymbol: z.ZodString;
    tokenName: z.ZodOptional<z.ZodString>;
    tokenDecimals: z.ZodDefault<z.ZodNumber>;
    from: z.ZodString;
    to: z.ZodString;
    amount: z.ZodString;
    formattedAmount: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: string;
    contractAddress: string;
    tokenSymbol: string;
    tokenDecimals: number;
    from: string;
    to: string;
    tokenName?: string | undefined;
    formattedAmount?: string | undefined;
}, {
    amount: string;
    contractAddress: string;
    tokenSymbol: string;
    from: string;
    to: string;
    tokenName?: string | undefined;
    tokenDecimals?: number | undefined;
    formattedAmount?: string | undefined;
}>;
export type TokenTransfer = z.infer<typeof TokenTransferSchema>;
export declare const NormalizedTransactionSchema: z.ZodObject<{
    id: z.ZodString;
    chain: z.ZodString;
    txHash: z.ZodString;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodDate;
    from: z.ZodArray<z.ZodString, "many">;
    to: z.ZodArray<z.ZodString, "many">;
    asset: z.ZodString;
    amount: z.ZodString;
    formattedAmount: z.ZodOptional<z.ZodString>;
    fee: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["confirmed", "pending", "failed"]>;
    inputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        txHash: z.ZodString;
        outputIndex: z.ZodNumber;
        address: z.ZodString;
        amount: z.ZodString;
        scriptPubKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        txHash: string;
        outputIndex: number;
        address: string;
        amount: string;
        scriptPubKey?: string | undefined;
    }, {
        txHash: string;
        outputIndex: number;
        address: string;
        amount: string;
        scriptPubKey?: string | undefined;
    }>, "many">>;
    outputs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        address: z.ZodString;
        amount: z.ZodString;
        scriptPubKey: z.ZodOptional<z.ZodString>;
        isChange: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        amount: string;
        index: number;
        scriptPubKey?: string | undefined;
        isChange?: boolean | undefined;
    }, {
        address: string;
        amount: string;
        index: number;
        scriptPubKey?: string | undefined;
        isChange?: boolean | undefined;
    }>, "many">>;
    tokenTransfers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        contractAddress: z.ZodString;
        tokenSymbol: z.ZodString;
        tokenName: z.ZodOptional<z.ZodString>;
        tokenDecimals: z.ZodDefault<z.ZodNumber>;
        from: z.ZodString;
        to: z.ZodString;
        amount: z.ZodString;
        formattedAmount: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount: string;
        contractAddress: string;
        tokenSymbol: string;
        tokenDecimals: number;
        from: string;
        to: string;
        tokenName?: string | undefined;
        formattedAmount?: string | undefined;
    }, {
        amount: string;
        contractAddress: string;
        tokenSymbol: string;
        from: string;
        to: string;
        tokenName?: string | undefined;
        tokenDecimals?: number | undefined;
        formattedAmount?: string | undefined;
    }>, "many">>;
    isContractCall: z.ZodOptional<z.ZodBoolean>;
    contractAddress: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    txHash: string;
    amount: string;
    status: "confirmed" | "pending" | "failed";
    from: string[];
    to: string[];
    id: string;
    chain: string;
    timestamp: Date;
    asset: string;
    contractAddress?: string | undefined;
    formattedAmount?: string | undefined;
    blockNumber?: number | undefined;
    fee?: string | undefined;
    inputs?: {
        txHash: string;
        outputIndex: number;
        address: string;
        amount: string;
        scriptPubKey?: string | undefined;
    }[] | undefined;
    outputs?: {
        address: string;
        amount: string;
        index: number;
        scriptPubKey?: string | undefined;
        isChange?: boolean | undefined;
    }[] | undefined;
    tokenTransfers?: {
        amount: string;
        contractAddress: string;
        tokenSymbol: string;
        tokenDecimals: number;
        from: string;
        to: string;
        tokenName?: string | undefined;
        formattedAmount?: string | undefined;
    }[] | undefined;
    isContractCall?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    txHash: string;
    amount: string;
    status: "confirmed" | "pending" | "failed";
    from: string[];
    to: string[];
    id: string;
    chain: string;
    timestamp: Date;
    asset: string;
    contractAddress?: string | undefined;
    formattedAmount?: string | undefined;
    blockNumber?: number | undefined;
    fee?: string | undefined;
    inputs?: {
        txHash: string;
        outputIndex: number;
        address: string;
        amount: string;
        scriptPubKey?: string | undefined;
    }[] | undefined;
    outputs?: {
        address: string;
        amount: string;
        index: number;
        scriptPubKey?: string | undefined;
        isChange?: boolean | undefined;
    }[] | undefined;
    tokenTransfers?: {
        amount: string;
        contractAddress: string;
        tokenSymbol: string;
        from: string;
        to: string;
        tokenName?: string | undefined;
        tokenDecimals?: number | undefined;
        formattedAmount?: string | undefined;
    }[] | undefined;
    isContractCall?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type NormalizedTransaction = z.infer<typeof NormalizedTransactionSchema>;
export interface PaginationOptions {
    limit?: number;
    offset?: number;
    direction?: "inbound" | "outbound" | "all";
    startTime?: Date;
    endTime?: Date;
    asset?: string;
}
export interface AddressBalance {
    address: string;
    chain: string;
    asset: string;
    balance: string;
    formattedBalance: string;
    unconfirmedBalance?: string;
    totalReceived?: string;
    totalSent?: string;
    txCount: number;
}
export interface BlockchainAdapter {
    readonly chain: string;
    validateAddress(address: string): boolean;
    validateTxHash(txHash: string): boolean;
    getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
    getAddressTransactions(address: string, options?: PaginationOptions): Promise<NormalizedTransaction[]>;
    getTokenTransfers?(address: string, options?: PaginationOptions): Promise<TokenTransfer[]>;
    getBalance(address: string): Promise<AddressBalance>;
    getTraceabilityStatus?(): {
        traceability: "FULL" | "LIMITED" | "UNSUPPORTED";
        reason?: string;
    };
}
//# sourceMappingURL=blockchain.d.ts.map