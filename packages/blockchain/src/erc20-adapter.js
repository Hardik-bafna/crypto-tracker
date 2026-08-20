export const KNOWN_TOKENS = {
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
    },
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
    },
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": {
        symbol: "WBTC",
        name: "Wrapped BTC",
        decimals: 8,
    },
    "0x6b175474e89094c44da98b954eedeac495271d0f": {
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
    },
};
export class ERC20Adapter {
    static parseTransfer(params) {
        const lowerContract = params.contractAddress.toLowerCase();
        const tokenMeta = KNOWN_TOKENS[lowerContract] || {
            symbol: "UNKNOWN_TOKEN",
            name: "Unknown Token",
            decimals: 18,
        };
        const rawStr = params.rawAmount.toString();
        const decimals = tokenMeta.decimals;
        const padded = rawStr.padStart(decimals + 1, "0");
        const intPart = padded.slice(0, padded.length - decimals);
        const fracPart = padded.slice(padded.length - decimals).replace(/0+$/, "");
        const formattedNum = fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
        return {
            contractAddress: params.contractAddress,
            tokenSymbol: tokenMeta.symbol,
            tokenName: tokenMeta.name,
            tokenDecimals: decimals,
            from: params.from,
            to: params.to,
            amount: rawStr,
            formattedAmount: `${formattedNum} ${tokenMeta.symbol}`,
        };
    }
    static createTokenTransaction(params) {
        const transfer = ERC20Adapter.parseTransfer({
            contractAddress: params.contractAddress,
            from: params.from,
            to: params.to,
            rawAmount: params.rawAmount,
            txHash: params.txHash,
            timestamp: params.timestamp,
        });
        return {
            id: `erc20-${params.txHash}`,
            chain: "ethereum",
            txHash: params.txHash,
            blockNumber: params.blockNumber,
            timestamp: params.timestamp,
            from: [params.from],
            to: [params.to],
            asset: transfer.tokenSymbol,
            amount: transfer.amount,
            formattedAmount: transfer.formattedAmount,
            fee: params.feeEth,
            status: "confirmed",
            tokenTransfers: [transfer],
            isContractCall: true,
            contractAddress: params.contractAddress,
            metadata: {
                tokenAddress: params.contractAddress,
                decimals: transfer.tokenDecimals,
            },
        };
    }
}
//# sourceMappingURL=erc20-adapter.js.map