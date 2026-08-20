import { AIToolName } from "@crypto-tracer/types";
import { TransactionGraph } from "@crypto-tracer/graph";
import { EntityDatabase } from "@crypto-tracer/entities";
import { PatternEngine } from "@crypto-tracer/analysis";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { RiskEngine } from "@crypto-tracer/risk";
export declare class ToolDispatcher {
    private entityDb;
    private patternEngine;
    private clusterEngine;
    private riskEngine;
    constructor(entityDb: EntityDatabase, patternEngine: PatternEngine, clusterEngine: ClusterEngine, riskEngine: RiskEngine);
    executeTool(toolName: AIToolName, params: Record<string, unknown>, contextGraph?: TransactionGraph): Promise<unknown>;
}
//# sourceMappingURL=tool-dispatcher.d.ts.map