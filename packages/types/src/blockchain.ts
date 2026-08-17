import { z } from "zod";

export type BlockchainType = "bitcoin" | "ethereum" | "erc20" | "monero" | "synthetic" | string;

export type TransactionStatus = "confirmed" | "pending" | "failed";

export const UTXOInputSchema = z.object({
  txHash: z.string(),
  outputIndex: z.number(),
  address: z.string(),
  amount: z.string(),
  scriptPubKey: z.string().optional(),
});
export type UTXOInput = z.infer<typeof UTXOInputSchema>;

export const UTXOOutputSchema = z.object({
  index: z.number(),
  address: z.string(),
  amount: z.string(),
  scriptPubKey: z.string().optional(),
  isChange: z.boolean().optional(),
});
export type UTXOOutput = z.infer<typeof UTXOOutputSchema>;

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
export type TokenTransfer = z.infer<typeof TokenTransferSchema>;

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
  getTraceabilityStatus?(): { traceability: "FULL" | "LIMITED" | "UNSUPPORTED"; reason?: string };
}
