import { RiskAssessment, RiskEngineConfig, PatternDetectionResult, Evidence, GraphNode, WalletCluster } from "@crypto-tracer/types";
export declare class RiskEngine {
    private config;
    constructor(customConfig?: RiskEngineConfig);
    evaluate(params: {
        target: string;
        targetType?: "address" | "transaction" | "txHash" | "cluster" | "investigation";
        patterns: PatternDetectionResult[];
        evidence: Evidence[];
        nodes?: GraphNode[];
        clusters?: WalletCluster[];
    }): RiskAssessment;
    /**
     * Evaluates the confidence (reliability) of the investigation based on
     * evidence quality, entity coverage, and data completeness.
     * This is independent from the risk score — risk measures severity of
     * indicators while confidence measures how much we can trust the results.
     */
    private evaluateConfidence;
}
//# sourceMappingURL=risk-engine.d.ts.map