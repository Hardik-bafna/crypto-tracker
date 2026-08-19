export function detectChangeAddresses(transactions) {
    const inferences = [];
    for (const tx of transactions) {
        if (tx.outputs && tx.outputs.length === 2 && tx.inputs && tx.inputs.length > 0) {
            const out0 = tx.outputs[0];
            const out1 = tx.outputs[1];
            const sender = tx.inputs[0].address;
            const amt0 = Number(out0.amount);
            const amt1 = Number(out1.amount);
            // Check if one output is round (e.g. ends in many zeros in satoshis) and other is not
            const is0Round = amt0 % 10000000 === 0; // 0.1 BTC round
            const is1Round = amt1 % 10000000 === 0;
            if (is0Round && !is1Round) {
                inferences.push({
                    senderAddress: sender,
                    changeAddress: out1.address,
                    txHash: tx.txHash,
                    confidence: 0.8,
                    reason: "Output 1 is non-round remainder while Output 0 is an exact round payment amount.",
                });
            }
            else if (is1Round && !is0Round) {
                inferences.push({
                    senderAddress: sender,
                    changeAddress: out0.address,
                    txHash: tx.txHash,
                    confidence: 0.8,
                    reason: "Output 0 is non-round remainder while Output 1 is an exact round payment amount.",
                });
            }
        }
    }
    return inferences;
}
//# sourceMappingURL=change-address.js.map