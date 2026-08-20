import { z } from "zod";
import { EvidenceSchema } from "./analysis";
export const AIToolNameEnum = z.enum([
    "get_wallet",
    "get_transaction",
    "get_transactions",
    "trace_funds",
    "find_path",
    "find_entity",
    "get_cluster",
    "detect_patterns",
    "calculate_risk",
    "get_evidence",
    "generate_report",
]);
export const AIToolCallSchema = z.object({
    tool: AIToolNameEnum,
    parameters: z.record(z.unknown()),
    reasoning: z.string(),
});
export const AIQueryRequestSchema = z.object({
    investigationId: z.string(),
    query: z.string().min(1, "Query cannot be empty"),
    history: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
    })).optional(),
});
export const AIQueryResponseSchema = z.object({
    query: z.string(),
    answer: z.string(),
    toolCallsExecuted: z.array(AIToolCallSchema),
    citedEvidence: z.array(EvidenceSchema),
    confidence: z.number().min(0).max(1),
    suggestedFollowUps: z.array(z.string()),
    disclaimers: z.array(z.string()),
});
//# sourceMappingURL=ai.js.map