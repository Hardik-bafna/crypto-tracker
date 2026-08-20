import { applyCommonInputHeuristic } from "./heuristics/common-input";
import { detectChangeAddresses } from "./heuristics/change-address";
import { detectTemporalCoActivity } from "./heuristics/temporal";
export class ClusterEngine {
    clusterWallets(transactions, chain = "bitcoin") {
        const clusters = [];
        let clusterIndex = 1;
        // 1. Common Input Ownership Heuristic (CIOH)
        const ciohGroups = applyCommonInputHeuristic(transactions);
        for (const group of ciohGroups) {
            const members = Array.from(group.addresses);
            clusters.push({
                clusterId: `cluster-cioh-${clusterIndex++}`,
                name: `Multi-Input Co-Ownership Cluster #${clusterIndex - 1}`,
                members,
                primaryAddress: members[0],
                confidence: group.confidence,
                signals: [
                    `Common-Input Spending Heuristic: Co-spent in ${group.txHashes.size} multi-input transactions.`,
                    "Joint signature validation indicates single controlling entity or automated wallet pool.",
                ],
                detailedSignals: [
                    {
                        type: "COMMON_INPUT_OWNERSHIP",
                        description: `Addresses spent together as inputs across ${group.txHashes.size} transactions.`,
                        confidence: group.confidence,
                        txHashes: Array.from(group.txHashes),
                    },
                ],
                chain,
                totalTxCount: group.txHashes.size,
                createdAt: new Date(),
                tags: ["Multi-Input", "Co-Owned"],
            });
        }
        // 2. Change Address Heuristic
        const changeInferences = detectChangeAddresses(transactions);
        const changeGroups = new Map();
        for (const inf of changeInferences) {
            const sender = inf.senderAddress.toLowerCase();
            const change = inf.changeAddress.toLowerCase();
            if (!changeGroups.has(sender))
                changeGroups.set(sender, new Set());
            changeGroups.get(sender).add(change);
        }
        for (const [sender, changeSet] of changeGroups) {
            // Check if already in a cluster
            const existing = clusters.find((c) => c.members.includes(sender));
            if (existing) {
                changeSet.forEach((addr) => {
                    if (!existing.members.includes(addr))
                        existing.members.push(addr);
                });
                existing.signals.push("Change address heuristic matched remaining unspent change outputs.");
            }
            else {
                const members = [sender, ...Array.from(changeSet)];
                clusters.push({
                    clusterId: `cluster-change-${clusterIndex++}`,
                    name: `Change Address Cluster #${clusterIndex - 1}`,
                    members,
                    primaryAddress: sender,
                    confidence: 0.8,
                    signals: [
                        "Change Address Heuristic: Identified unspent output remainder returned to new key.",
                    ],
                    detailedSignals: [
                        {
                            type: "CHANGE_ADDRESS_HEURISTIC",
                            description: "Non-round output remainder associated with primary sender.",
                            confidence: 0.8,
                        },
                    ],
                    chain,
                    createdAt: new Date(),
                    tags: ["Change-Address"],
                });
            }
        }
        // 3. Temporal Co-Activity
        const temporalGroups = detectTemporalCoActivity(transactions);
        for (const temp of temporalGroups) {
            const existing = clusters.find((c) => temp.addresses.some((a) => c.members.includes(a)));
            if (existing) {
                temp.addresses.forEach((a) => {
                    if (!existing.members.includes(a))
                        existing.members.push(a);
                });
                existing.signals.push(`Temporal synchronization observed across ${temp.coActivityCount} concurrent transactions.`);
            }
            else {
                clusters.push({
                    clusterId: `cluster-temp-${clusterIndex++}`,
                    name: `Temporal Activity Cluster #${clusterIndex - 1}`,
                    members: temp.addresses,
                    primaryAddress: temp.addresses[0],
                    confidence: temp.confidence,
                    signals: [
                        `Temporal Proximity: ${temp.coActivityCount} transactions initiated within synchronized intervals.`,
                    ],
                    chain,
                    createdAt: new Date(),
                    tags: ["Temporal-Correlation"],
                });
            }
        }
        return clusters;
    }
}
//# sourceMappingURL=cluster-engine.js.map