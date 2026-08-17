import {
  AttributionItem,
  NormalizedTransaction,
  GraphEdge,
} from "@crypto-tracer/types";
import { EntityDatabase } from "./entity-database";

export class AttributionEngine {
  constructor(private entityDb: EntityDatabase) {}

  generateAttributions(
    addresses: string[],
    transactions: NormalizedTransaction[],
    edges: GraphEdge[]
  ): {
    observedFacts: string[];
    inferences: string[];
    attributions: AttributionItem[];
  } {
    const observedFacts: string[] = [];
    const inferences: string[] = [];
    const attributions: AttributionItem[] = [];
    const processedAddresses = new Set<string>();

    // 1. Generate Observed Facts from actual transactions
    for (const tx of transactions) {
      const fromList = tx.from.map((f) => `${f.slice(0, 8)}...`).join(", ");
      const toList = tx.to.map((t) => `${t.slice(0, 8)}...`).join(", ");
      const amt = tx.formattedAmount || `${tx.amount} ${tx.asset}`;
      const dt = tx.timestamp.toISOString().replace("T", " ").slice(0, 19);

      observedFacts.push(
        `[${dt}] Observed transfer of ${amt} on ${tx.chain} from [${fromList}] to [${toList}] (Tx: ${tx.txHash.slice(0, 10)}...)`
      );
    }

    // 2. Attribute addresses based on intelligence dataset
    for (const addr of addresses) {
      const lower = addr.toLowerCase();
      if (processedAddresses.has(lower)) continue;
      processedAddresses.add(lower);

      const known = this.entityDb.getEntityByAddress(addr);
      if (known) {
        const { entity, mapping } = known;
        const confidenceScore =
          mapping.confidence === "VERIFIED"
            ? 0.99
            : mapping.confidence === "HIGH"
            ? 0.85
            : mapping.confidence === "MEDIUM"
            ? 0.65
            : 0.4;

        attributions.push({
          address: addr,
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          attributionType: "ATTRIBUTION",
          confidence: confidenceScore,
          explanation: `Address identified as ${mapping.label || entity.name} (${entity.type}) with ${mapping.confidence} confidence from verified source: ${mapping.source}.`,
          supportingEvidenceIds: [`ent-match-${entity.id}-${addr.slice(0, 8)}`],
        });
      }
    }

    // 3. Generate Inferences from interaction patterns
    for (const edge of edges) {
      const targetKnown = this.entityDb.getEntityByAddress(edge.target);
      const sourceKnown = this.entityDb.getEntityByAddress(edge.source);

      if (targetKnown && targetKnown.entity.type === "EXCHANGE") {
        inferences.push(
          `INFERENCE: Address ${edge.source.slice(0, 8)}... transferred ${edge.formattedAmount} directly to ${targetKnown.entity.name} (${edge.target.slice(0, 8)}...). The source address may be an unhosted depositor account for this exchange.`
        );
      }

      if (targetKnown && targetKnown.entity.type === "MIXER") {
        inferences.push(
          `INFERENCE: Address ${edge.source.slice(0, 8)}... deposited ${edge.formattedAmount} into privacy pool ${targetKnown.entity.name}. Direct on-chain lineage is obscured beyond this point.`
        );
      }

      if (sourceKnown && sourceKnown.entity.type === "MIXER") {
        inferences.push(
          `INFERENCE: Address ${edge.target.slice(0, 8)}... received ${edge.formattedAmount} from privacy pool ${sourceKnown.entity.name}. Likely recipient/relayer withdrawal.`
        );
      }
    }

    return {
      observedFacts,
      inferences: Array.from(new Set(inferences)),
      attributions,
    };
  }
}
