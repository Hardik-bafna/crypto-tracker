export class BaseBlockchainAdapter {
    formatUnits(amountBig, decimals) {
        const str = amountBig.toString();
        if (decimals === 0)
            return str;
        const isNegative = str.startsWith("-");
        const cleanStr = isNegative ? str.slice(1) : str;
        const padded = cleanStr.padStart(decimals + 1, "0");
        const integerPart = padded.slice(0, padded.length - decimals);
        const fractionPart = padded.slice(padded.length - decimals).replace(/0+$/, "");
        const result = fractionPart.length > 0 ? `${integerPart}.${fractionPart}` : integerPart;
        return isNegative ? `-${result}` : result;
    }
    getTraceabilityStatus() {
        return { traceability: "FULL" };
    }
}
//# sourceMappingURL=base-adapter.js.map