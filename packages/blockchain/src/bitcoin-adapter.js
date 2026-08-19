import { BaseBlockchainAdapter } from "./base-adapter";
export class BitcoinAdapter extends BaseBlockchainAdapter {
    chain = "bitcoin";
    txStore = new Map();
    addressTxMap = new Map();
    addressBalances = new Map();
    constructor(seedTransactions) {
        super();
        if (seedTransactions) {
            this.seedData(seedTransactions);
        }
    }
    validateAddress(address) {
        if (!address || typeof address !== "string")
            return false;
        const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/i;
        return btcRegex.test(address.trim());
    }
    validateTxHash(txHash) {
        if (!txHash || typeof txHash !== "string")
            return false;
        return /^[a-fA-F0-9]{64}$/.test(txHash.trim());
    }
    seedData(transactions) {
        for (const tx of transactions) {
            this.txStore.set(tx.txHash.toLowerCase(), tx);
            for (const fromAddr of tx.from) {
                const lower = fromAddr.toLowerCase();
                const list = this.addressTxMap.get(lower) || [];
                if (!list.includes(tx.txHash.toLowerCase())) {
                    list.push(tx.txHash.toLowerCase());
                    this.addressTxMap.set(lower, list);
                }
            }
            for (const toAddr of tx.to) {
                const lower = toAddr.toLowerCase();
                const list = this.addressTxMap.get(lower) || [];
                if (!list.includes(tx.txHash.toLowerCase())) {
                    list.push(tx.txHash.toLowerCase());
                    this.addressTxMap.set(lower, list);
                }
            }
        }
    }
    setMockBalance(address, balance) {
        this.addressBalances.set(address.toLowerCase(), balance);
    }
    async getTransaction(txHash) {
        const lower = txHash.toLowerCase();
        let tx = this.txStore.get(lower);
        if (!tx && this.validateTxHash(txHash)) {
            try {
                const res = await fetch(`https://blockstream.info/api/tx/${txHash}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; CryptoTracer/1.0)",
                        "Accept": "application/json",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.txid) {
                        const inputs = (data.vin || []).map((vin) => ({
                            txHash: vin.txid,
                            outputIndex: vin.vout,
                            address: vin.prevout?.scriptpubkey_address || "unknown",
                            amount: (vin.prevout?.value || 0).toString(),
                        }));
                        const outputs = (data.vout || []).map((vout, idx) => ({
                            index: idx,
                            address: vout.scriptpubkey_address || "unknown",
                            amount: (vout.value || 0).toString(),
                        }));
                        const from = Array.from(new Set(inputs.map((i) => i.address)));
                        const to = Array.from(new Set(outputs.map((o) => o.address)));
                        const totalOut = outputs.reduce((acc, o) => acc + BigInt(o.amount || "0"), 0n);
                        tx = {
                            id: `btc-${data.txid}`,
                            chain: "bitcoin",
                            txHash: data.txid,
                            blockNumber: data.status?.block_height,
                            timestamp: new Date((data.status?.block_time || Date.now() / 1000) * 1000),
                            from,
                            to,
                            asset: "BTC",
                            amount: totalOut.toString(),
                            formattedAmount: `${(Number(totalOut) / 1e8).toFixed(8)} BTC`,
                            fee: data.fee ? `${(data.fee / 1e8).toFixed(8)} BTC` : undefined,
                            status: "confirmed",
                            inputs,
                            outputs,
                            isContractCall: false,
                            metadata: { source: "bitcoin_mainnet_live" },
                        };
                        this.seedData([tx]);
                    }
                }
            }
            catch { }
        }
        return tx || null;
    }
    async getAddressTransactions(address, options) {
        const lower = address.toLowerCase();
        let hashes = this.addressTxMap.get(lower) || [];
        // Attempt live Bitcoin Mainnet query via Blockstream API if not in local store
        if (hashes.length === 0 && this.validateAddress(address)) {
            try {
                console.log(`[BitcoinAdapter] Fetching txs for ${address} from Blockstream...`);
                const res = await fetch(`https://blockstream.info/api/address/${address}/txs`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; CryptoTracer/1.0)",
                        "Accept": "application/json",
                    },
                });
                console.log(`[BitcoinAdapter] Blockstream status: ${res.status}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[BitcoinAdapter] Got ${data?.length} txs from Blockstream`);
                    if (Array.isArray(data) && data.length > 0) {
                        const liveTxs = data.slice(0, 20).map((tx) => {
                            const inputs = (tx.vin || []).map((vin) => ({
                                txHash: vin.txid,
                                outputIndex: vin.vout,
                                address: vin.prevout?.scriptpubkey_address || "unknown",
                                amount: (vin.prevout?.value || 0).toString(),
                            }));
                            const outputs = (tx.vout || []).map((vout, idx) => ({
                                index: idx,
                                address: vout.scriptpubkey_address || "unknown",
                                amount: (vout.value || 0).toString(),
                            }));
                            const from = Array.from(new Set(inputs.map((i) => i.address)));
                            const to = Array.from(new Set(outputs.map((o) => o.address)));
                            const totalOut = outputs.reduce((acc, o) => acc + BigInt(o.amount || "0"), 0n);
                            return {
                                id: `btc-${tx.txid}`,
                                chain: "bitcoin",
                                txHash: tx.txid,
                                blockNumber: tx.status?.block_height,
                                timestamp: new Date((tx.status?.block_time || Date.now() / 1000) * 1000),
                                from,
                                to,
                                asset: "BTC",
                                amount: totalOut.toString(),
                                formattedAmount: `${(Number(totalOut) / 1e8).toFixed(8)} BTC`,
                                fee: tx.fee ? `${(tx.fee / 1e8).toFixed(8)} BTC` : undefined,
                                status: "confirmed",
                                inputs,
                                outputs,
                                isContractCall: false,
                                metadata: { source: "bitcoin_mainnet_live" },
                            };
                        });
                        this.seedData(liveTxs);
                        console.log(`[BitcoinAdapter] Seeded ${liveTxs.length} txs into store`);
                    }
                }
            }
            catch (e) {
                console.error(`[BitcoinAdapter] Fetch failed: ${e?.message}`);
            }
        }
        // Re-read hashes after potential live fetch
        hashes = this.addressTxMap.get(lower) || [];
        console.log(`[BitcoinAdapter] hashes after fetch: ${hashes.length} for ${lower}`);
        let transactions = hashes
            .map((h) => this.txStore.get(h))
            .filter((tx) => !!tx);
        if (options?.direction === "inbound") {
            transactions = transactions.filter((tx) => tx.to.some((t) => t.toLowerCase() === lower));
        }
        else if (options?.direction === "outbound") {
            transactions = transactions.filter((tx) => tx.from.some((f) => f.toLowerCase() === lower));
        }
        if (options?.startTime) {
            transactions = transactions.filter((tx) => tx.timestamp >= options.startTime);
        }
        if (options?.endTime) {
            transactions = transactions.filter((tx) => tx.timestamp <= options.endTime);
        }
        transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const offset = options?.offset || 0;
        const limit = options?.limit || 50;
        return transactions.slice(offset, offset + limit);
    }
    async getBalance(address) {
        const lower = address.toLowerCase();
        const stored = this.addressBalances.get(lower);
        if (stored)
            return stored;
        const txs = await this.getAddressTransactions(address);
        let totalReceived = 0;
        let totalSent = 0;
        for (const tx of txs) {
            const isSender = tx.from.some((f) => f.toLowerCase() === lower);
            const isReceiver = tx.to.some((t) => t.toLowerCase() === lower);
            const val = parseFloat(tx.formattedAmount || tx.amount) || 0;
            if (isReceiver)
                totalReceived += val;
            if (isSender)
                totalSent += val;
        }
        const currentBalance = Math.max(0, totalReceived - totalSent);
        return {
            address,
            chain: this.chain,
            asset: "BTC",
            balance: currentBalance.toFixed(8),
            formattedBalance: `${currentBalance.toFixed(8)} BTC`,
            totalReceived: totalReceived.toFixed(8),
            totalSent: totalSent.toFixed(8),
            txCount: txs.length,
        };
    }
    static createBitcoinTransaction(params) {
        const fromAddresses = Array.from(new Set(params.inputs.map((i) => i.address)));
        const toAddresses = Array.from(new Set(params.outputs.map((o) => o.address)));
        const totalOutSat = params.outputs.reduce((acc, o) => acc + BigInt(o.amount), 0n);
        const amountBtc = (Number(totalOutSat) / 1e8).toFixed(8);
        return {
            id: `btc-${params.txHash}`,
            chain: "bitcoin",
            txHash: params.txHash,
            blockNumber: params.blockNumber,
            timestamp: params.timestamp,
            from: fromAddresses,
            to: toAddresses,
            asset: "BTC",
            amount: totalOutSat.toString(),
            formattedAmount: `${amountBtc} BTC`,
            fee: params.feeSats ? `${(params.feeSats / 1e8).toFixed(8)} BTC` : undefined,
            status: "confirmed",
            inputs: params.inputs,
            outputs: params.outputs,
            isContractCall: false,
            metadata: params.metadata,
        };
    }
    synthesizeDynamicBtcTxs(address) {
        const baseTime = Date.now() - 4 * 3600 * 1000;
        const hop1 = `bc1qhop1${address.slice(7, 15)}11111111111111111111111111`;
        const hop2 = `bc1qhop2${address.slice(7, 15)}22222222222222222222222222`;
        const aggregator = "bc1qaggregator999999999999999999999999999";
        const kraken = "bc1qkraken00000000000000000000000000000000";
        const dynamicTxs = [
            {
                id: `tx-dyn-btc-${address.slice(0, 8)}-1`,
                chain: "bitcoin",
                txHash: `a${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
                timestamp: new Date(baseTime),
                from: [address],
                to: [hop1],
                asset: "BTC",
                amount: "1425000000",
                formattedAmount: "14.25 BTC",
                status: "confirmed",
                metadata: { dynamic: true, step: 1, note: "Initial Target Outflow" },
            },
            {
                id: `tx-dyn-btc-${address.slice(0, 8)}-2`,
                chain: "bitcoin",
                txHash: `b${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
                timestamp: new Date(baseTime + 20 * 60 * 1000),
                from: [hop1],
                to: [hop2],
                asset: "BTC",
                amount: "1350000000",
                formattedAmount: "13.50 BTC",
                status: "confirmed",
                metadata: { dynamic: true, step: 2, note: "Peel Chain Intermediary" },
            },
            {
                id: `tx-dyn-btc-${address.slice(0, 8)}-3`,
                chain: "bitcoin",
                txHash: `c${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
                timestamp: new Date(baseTime + 45 * 60 * 1000),
                from: [hop2],
                to: [aggregator],
                asset: "BTC",
                amount: "1300000000",
                formattedAmount: "13.00 BTC",
                status: "confirmed",
                metadata: { dynamic: true, step: 3, note: "Syndicate Aggregator" },
            },
            {
                id: `tx-dyn-btc-${address.slice(0, 8)}-4`,
                chain: "bitcoin",
                txHash: `d${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.padEnd(64, "0"),
                timestamp: new Date(baseTime + 120 * 60 * 1000),
                from: [aggregator],
                to: [kraken],
                asset: "BTC",
                amount: "1250000000",
                formattedAmount: "12.50 BTC",
                status: "confirmed",
                metadata: { dynamic: true, step: 4, note: "Cashout Deposit to Kraken" },
            },
        ];
        this.seedData(dynamicTxs);
    }
}
//# sourceMappingURL=bitcoin-adapter.js.map