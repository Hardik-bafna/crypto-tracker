import { z } from "zod";
export declare const AIToolNameEnum: z.ZodEnum<["get_wallet", "get_transaction", "get_transactions", "trace_funds", "find_path", "find_entity", "get_cluster", "detect_patterns", "calculate_risk", "get_evidence", "generate_report"]>;
export type AIToolName = z.infer<typeof AIToolNameEnum>;
export declare const AIToolCallSchema: z.ZodObject<{
    tool: z.ZodEnum<["get_wallet", "get_transaction", "get_transactions", "trace_funds", "find_path", "find_entity", "get_cluster", "detect_patterns", "calculate_risk", "get_evidence", "generate_report"]>;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    reasoning: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
    parameters: Record<string, unknown>;
    reasoning: string;
}, {
    tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
    parameters: Record<string, unknown>;
    reasoning: string;
}>;
export type AIToolCall = z.infer<typeof AIToolCallSchema>;
export declare const AIQueryRequestSchema: z.ZodObject<{
    investigationId: z.ZodString;
    query: z.ZodString;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant" | "system";
        content: string;
    }, {
        role: "user" | "assistant" | "system";
        content: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    investigationId: string;
    query: string;
    history?: {
        role: "user" | "assistant" | "system";
        content: string;
    }[] | undefined;
}, {
    investigationId: string;
    query: string;
    history?: {
        role: "user" | "assistant" | "system";
        content: string;
    }[] | undefined;
}>;
export type AIQueryRequest = z.infer<typeof AIQueryRequestSchema>;
export declare const AIQueryResponseSchema: z.ZodObject<{
    query: z.ZodString;
    answer: z.ZodString;
    toolCallsExecuted: z.ZodArray<z.ZodObject<{
        tool: z.ZodEnum<["get_wallet", "get_transaction", "get_transactions", "trace_funds", "find_path", "find_entity", "get_cluster", "detect_patterns", "calculate_risk", "get_evidence", "generate_report"]>;
        parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
        parameters: Record<string, unknown>;
        reasoning: string;
    }, {
        tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
        parameters: Record<string, unknown>;
        reasoning: string;
    }>, "many">;
    citedEvidence: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        confidence: z.ZodNumber;
        severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
        source: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodDate;
        transactionHashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        addresses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        timestamp: Date;
        confidence: number;
        description: string;
        addresses: string[];
        title: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        transactionHashes: string[];
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
    }, {
        type: string;
        id: string;
        timestamp: Date;
        confidence: number;
        description: string;
        title: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        addresses?: string[] | undefined;
        transactionHashes?: string[] | undefined;
    }>, "many">;
    confidence: z.ZodNumber;
    suggestedFollowUps: z.ZodArray<z.ZodString, "many">;
    disclaimers: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    query: string;
    answer: string;
    toolCallsExecuted: {
        tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
        parameters: Record<string, unknown>;
        reasoning: string;
    }[];
    citedEvidence: {
        type: string;
        id: string;
        timestamp: Date;
        confidence: number;
        description: string;
        addresses: string[];
        title: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        transactionHashes: string[];
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
    }[];
    suggestedFollowUps: string[];
    disclaimers: string[];
}, {
    confidence: number;
    query: string;
    answer: string;
    toolCallsExecuted: {
        tool: "get_wallet" | "get_transaction" | "get_transactions" | "trace_funds" | "find_path" | "find_entity" | "get_cluster" | "detect_patterns" | "calculate_risk" | "get_evidence" | "generate_report";
        parameters: Record<string, unknown>;
        reasoning: string;
    }[];
    citedEvidence: {
        type: string;
        id: string;
        timestamp: Date;
        confidence: number;
        description: string;
        title: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        addresses?: string[] | undefined;
        transactionHashes?: string[] | undefined;
    }[];
    suggestedFollowUps: string[];
    disclaimers: string[];
}>;
export type AIQueryResponse = z.infer<typeof AIQueryResponseSchema>;
//# sourceMappingURL=ai.d.ts.map