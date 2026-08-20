import { z } from "zod";
export declare const SuspiciousPatternTypeEnum: z.ZodEnum<["FAN_OUT", "FAN_IN", "RAPID_MOVEMENT", "PEEL_CHAIN", "HIGH_HOP_MOVEMENT", "MIXER_INTERACTION", "BRIDGE_INTERACTION", "ILLICIT_INTERACTION", "CIRCULAR_FLOW", "STRUCTURING"]>;
export type SuspiciousPatternType = z.infer<typeof SuspiciousPatternTypeEnum>;
export declare const EvidenceSeverityEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
export type EvidenceSeverity = z.infer<typeof EvidenceSeverityEnum>;
export declare const EvidenceSchema: z.ZodObject<{
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
}>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export declare const PatternDetectionResultSchema: z.ZodObject<{
    ruleId: z.ZodString;
    patternType: z.ZodEnum<["FAN_OUT", "FAN_IN", "RAPID_MOVEMENT", "PEEL_CHAIN", "HIGH_HOP_MOVEMENT", "MIXER_INTERACTION", "BRIDGE_INTERACTION", "ILLICIT_INTERACTION", "CIRCULAR_FLOW", "STRUCTURING"]>;
    title: z.ZodString;
    description: z.ZodString;
    severity: z.ZodNumber;
    confidence: z.ZodNumber;
    evidence: z.ZodArray<z.ZodObject<{
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
    affectedAddresses: z.ZodArray<z.ZodString, "many">;
    affectedTxHashes: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    description: string;
    title: string;
    severity: number;
    ruleId: string;
    patternType: "FAN_OUT" | "FAN_IN" | "RAPID_MOVEMENT" | "PEEL_CHAIN" | "HIGH_HOP_MOVEMENT" | "MIXER_INTERACTION" | "BRIDGE_INTERACTION" | "ILLICIT_INTERACTION" | "CIRCULAR_FLOW" | "STRUCTURING";
    evidence: {
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
    affectedAddresses: string[];
    affectedTxHashes: string[];
    metrics?: Record<string, unknown> | undefined;
}, {
    confidence: number;
    description: string;
    title: string;
    severity: number;
    ruleId: string;
    patternType: "FAN_OUT" | "FAN_IN" | "RAPID_MOVEMENT" | "PEEL_CHAIN" | "HIGH_HOP_MOVEMENT" | "MIXER_INTERACTION" | "BRIDGE_INTERACTION" | "ILLICIT_INTERACTION" | "CIRCULAR_FLOW" | "STRUCTURING";
    evidence: {
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
    affectedAddresses: string[];
    affectedTxHashes: string[];
    metrics?: Record<string, unknown> | undefined;
}>;
export type PatternDetectionResult = z.infer<typeof PatternDetectionResultSchema>;
export interface PatternRuleConfig {
    fanOutThreshold?: number;
    fanOutTimeWindowSeconds?: number;
    fanInThreshold?: number;
    fanInTimeWindowSeconds?: number;
    rapidMovementMaxIntervalSeconds?: number;
    peelChainMinHops?: number;
    peelChainRatioThreshold?: number;
    highHopThreshold?: number;
}
//# sourceMappingURL=analysis.d.ts.map