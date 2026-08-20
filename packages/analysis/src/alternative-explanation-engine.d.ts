import { PatternDetectionResult, AlternativeExplanation } from "@crypto-tracer/types";
export declare class AlternativeExplanationEngine {
    /**
     * Analyze detected patterns and produce alternative (non-criminal)
     * explanations for each. Pure deterministic mapping — no ML/LLM.
     */
    static analyze(patterns: PatternDetectionResult[]): AlternativeExplanation[];
}
//# sourceMappingURL=alternative-explanation-engine.d.ts.map