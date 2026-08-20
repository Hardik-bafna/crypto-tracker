import { BlockchainAdapter } from "@crypto-tracer/types";
export declare class BlockchainAdapterFactory {
    private static adapters;
    private static syntheticAdapter;
    static getAdapter(chain: string, mode?: "live" | "demo"): BlockchainAdapter;
    static detectChain(input: string): {
        chain: string;
        type: "address" | "txHash" | "unknown";
    };
}
//# sourceMappingURL=adapter-factory.d.ts.map