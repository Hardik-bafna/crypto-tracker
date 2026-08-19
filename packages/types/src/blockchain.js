import { z } from "zod";
export const UTXOInputSchema = z.object({
    txHash: z.string(),
    outputIndex: z.number(),
    address: z.string(),
    amount: z.string(),
    scriptPubKey: z.string().optional(),
});
export const UTXOOutputSchema = z.object({
    index: z.number(),
    address: z.string(),
    amount: z.string(),
    scriptPubKey: z.string().optional(),
    isChange: z.boolean().optional(),
});
export const TokenTransferSchema = z.object({
    contractAddress: z.string(),
    tokenSymbol: z.string(),
    tokenName: z.string().optional(),
    tokenDecimals: z.number().default(18),
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    formattedAmount: z.string().optional(),
});
export const NormalizedTransactionSchema = z.object({
    id: z.string(),
    chain: z.string(),
    txHash: z.string(),
    blockNumber: z.number().optional(),
    timestamp: z.coerce.date(),
    from: z.array(z.string()),
    to: z.array(z.string()),
    asset: z.string(),
    amount: z.string(),
    formattedAmount: z.string().optional(),
    fee: z.string().optional(),
    status: z.enum(["confirmed", "pending", "failed"]),
    inputs: z.array(UTXOInputSchema).optional(),
    outputs: z.array(UTXOOutputSchema).optional(),
    tokenTransfers: z.array(TokenTransferSchema).optional(),
    isContractCall: z.boolean().optional(),
    contractAddress: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});
//# sourceMappingURL=blockchain.js.map