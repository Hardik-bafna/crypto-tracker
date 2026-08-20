import { TransactionGraph } from "@crypto-tracer/graph";
import { EntityDatabase } from "@crypto-tracer/entities";
import { PatternDetectionResult, Evidence, PatternRuleConfig } from "@crypto-tracer/types";
export declare class PatternEngine {
    private entityDb;
    private config;
    constructor(entityDb: EntityDatabase, config?: PatternRuleConfig);
    analyze(graph: TransactionGraph): {
        patterns: PatternDetectionResult[];
        evidence: Evidence[];
    };
}
//# sourceMappingURL=pattern-engine.d.ts.map