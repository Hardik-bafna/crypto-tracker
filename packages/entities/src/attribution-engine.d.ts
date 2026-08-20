import { AttributionItem, NormalizedTransaction, GraphEdge } from "@crypto-tracer/types";
import { EntityDatabase } from "./entity-database";
export declare class AttributionEngine {
    private entityDb;
    constructor(entityDb: EntityDatabase);
    generateAttributions(addresses: string[], transactions: NormalizedTransaction[], edges: GraphEdge[]): {
        observedFacts: string[];
        inferences: string[];
        attributions: AttributionItem[];
    };
}
//# sourceMappingURL=attribution-engine.d.ts.map