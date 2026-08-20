import { AIQueryRequest, AIQueryResponse, Investigation } from "@crypto-tracer/types";
import { ToolDispatcher } from "./tool-dispatcher";
export declare class AIInvestigator {
    private toolDispatcher;
    constructor(toolDispatcher: ToolDispatcher);
    processQuery(request: AIQueryRequest, investigation?: Investigation): Promise<AIQueryResponse>;
}
//# sourceMappingURL=ai-investigator.d.ts.map