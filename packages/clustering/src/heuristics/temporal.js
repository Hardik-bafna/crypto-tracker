export function detectTemporalCoActivity(transactions, timeWindowSeconds = 300 // 5 minutes
) {
    const addressPairs = new Map();
    // Sort by timestamp
    const sorted = [...transactions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    for (let i = 0; i < sorted.length; i++) {
        const txA = sorted[i];
        const fromA = txA.from[0]?.toLowerCase();
        if (!fromA)
            continue;
        for (let j = i + 1; j < sorted.length; j++) {
            const txB = sorted[j];
            const delta = (txB.timestamp.getTime() - txA.timestamp.getTime()) / 1000;
            if (delta > timeWindowSeconds)
                break;
            const fromB = txB.from[0]?.toLowerCase();
            if (!fromB || fromA === fromB)
                continue;
            const pairKey = fromA < fromB ? `${fromA}::${fromB}` : `${fromB}::${fromA}`;
            const curr = addressPairs.get(pairKey) || { count: 0, addrs: [fromA, fromB] };
            curr.count++;
            addressPairs.set(pairKey, curr);
        }
    }
    const clusters = [];
    for (const [, { count, addrs }] of addressPairs) {
        if (count >= 2) {
            clusters.push({
                addresses: addrs,
                coActivityCount: count,
                confidence: Math.min(0.85, 0.5 + count * 0.1),
            });
        }
    }
    return clusters;
}
//# sourceMappingURL=temporal.js.map