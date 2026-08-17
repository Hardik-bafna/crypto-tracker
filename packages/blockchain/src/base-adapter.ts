import {
  BlockchainAdapter,
  NormalizedTransaction,
  PaginationOptions,
  AddressBalance,
} from "@crypto-tracer/types";

export abstract class BaseBlockchainAdapter implements BlockchainAdapter {
  abstract readonly chain: string;

  abstract validateAddress(address: string): boolean;
  abstract validateTxHash(txHash: string): boolean;
  abstract getTransaction(txHash: string): Promise<NormalizedTransaction | null>;
  abstract getAddressTransactions(
    address: string,
    options?: PaginationOptions
  ): Promise<NormalizedTransaction[]>;
  abstract getBalance(address: string): Promise<AddressBalance>;

  protected formatUnits(amountBig: bigint | string | number, decimals: number): string {
    const str = amountBig.toString();
    if (decimals === 0) return str;
    const isNegative = str.startsWith("-");
    const cleanStr = isNegative ? str.slice(1) : str;
    const padded = cleanStr.padStart(decimals + 1, "0");
    const integerPart = padded.slice(0, padded.length - decimals);
    const fractionPart = padded.slice(padded.length - decimals).replace(/0+$/, "");
    const result = fractionPart.length > 0 ? `${integerPart}.${fractionPart}` : integerPart;
    return isNegative ? `-${result}` : result;
  }

  getTraceabilityStatus(): { traceability: "FULL" | "LIMITED" | "UNSUPPORTED"; reason?: string } {
    return { traceability: "FULL" };
  }
}
