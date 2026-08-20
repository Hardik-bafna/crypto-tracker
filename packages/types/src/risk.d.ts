import { z } from "zod";
export declare const RiskLevelEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
export type RiskLevel = z.infer<typeof RiskLevelEnum>;
export declare const EvidenceChainItemSchema: z.ZodObject<{
    evidenceId: z.ZodString;
    ruleId: z.ZodString;
    patternType: z.ZodString;
    explanation: z.ZodString;
    transactionHashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    wallets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    entityName: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDate;
    severity: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    confidence: number;
    explanation: string;
    severity: string;
    transactionHashes: string[];
    ruleId: string;
    patternType: string;
    evidenceId: string;
    wallets: string[];
    entityName?: string | undefined;
    entityType?: string | undefined;
}, {
    timestamp: Date;
    confidence: number;
    explanation: string;
    severity: string;
    ruleId: string;
    patternType: string;
    evidenceId: string;
    entityName?: string | undefined;
    entityType?: string | undefined;
    transactionHashes?: string[] | undefined;
    wallets?: string[] | undefined;
}>;
export type EvidenceChainItem = z.infer<typeof EvidenceChainItemSchema>;
export declare const RiskFactorSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
    scoreDelta: z.ZodNumber;
    maxPossible: z.ZodNumber;
    description: z.ZodString;
    severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
        evidenceId: z.ZodString;
        ruleId: z.ZodString;
        patternType: z.ZodString;
        explanation: z.ZodString;
        transactionHashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        wallets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        entityName: z.ZodOptional<z.ZodString>;
        entityType: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodDate;
        severity: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp: Date;
        confidence: number;
        explanation: string;
        severity: string;
        transactionHashes: string[];
        ruleId: string;
        patternType: string;
        evidenceId: string;
        wallets: string[];
        entityName?: string | undefined;
        entityType?: string | undefined;
    }, {
        timestamp: Date;
        confidence: number;
        explanation: string;
        severity: string;
        ruleId: string;
        patternType: string;
        evidenceId: string;
        entityName?: string | undefined;
        entityType?: string | undefined;
        transactionHashes?: string[] | undefined;
        wallets?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    category: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    scoreDelta: number;
    maxPossible: number;
    evidenceIds: string[];
    evidenceChain: {
        timestamp: Date;
        confidence: number;
        explanation: string;
        severity: string;
        transactionHashes: string[];
        ruleId: string;
        patternType: string;
        evidenceId: string;
        wallets: string[];
        entityName?: string | undefined;
        entityType?: string | undefined;
    }[];
}, {
    id: string;
    name: string;
    category: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    scoreDelta: number;
    maxPossible: number;
    evidenceIds?: string[] | undefined;
    evidenceChain?: {
        timestamp: Date;
        confidence: number;
        explanation: string;
        severity: string;
        ruleId: string;
        patternType: string;
        evidenceId: string;
        entityName?: string | undefined;
        entityType?: string | undefined;
        transactionHashes?: string[] | undefined;
        wallets?: string[] | undefined;
    }[] | undefined;
}>;
export type RiskFactor = z.infer<typeof RiskFactorSchema>;
export declare const ConfidenceLevelEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;
export declare const ConfidenceAssessmentSchema: z.ZodObject<{
    confidenceScore: z.ZodNumber;
    confidenceLevel: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>;
    strengths: z.ZodArray<z.ZodString, "many">;
    limitations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidenceScore: number;
    confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    strengths: string[];
    limitations: string[];
}, {
    confidenceScore: number;
    confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    strengths: string[];
    limitations: string[];
}>;
export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;
export declare const RiskAssessmentSchema: z.ZodObject<{
    target: z.ZodString;
    targetType: z.ZodEnum<["address", "transaction", "txHash", "cluster", "investigation"]>;
    overallScore: z.ZodNumber;
    riskLevel: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    factors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        category: z.ZodString;
        scoreDelta: z.ZodNumber;
        maxPossible: z.ZodNumber;
        description: z.ZodString;
        severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
        evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
            evidenceId: z.ZodString;
            ruleId: z.ZodString;
            patternType: z.ZodString;
            explanation: z.ZodString;
            transactionHashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            wallets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            entityName: z.ZodOptional<z.ZodString>;
            entityType: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodDate;
            severity: z.ZodString;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            transactionHashes: string[];
            ruleId: string;
            patternType: string;
            evidenceId: string;
            wallets: string[];
            entityName?: string | undefined;
            entityType?: string | undefined;
        }, {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            ruleId: string;
            patternType: string;
            evidenceId: string;
            entityName?: string | undefined;
            entityType?: string | undefined;
            transactionHashes?: string[] | undefined;
            wallets?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        category: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        scoreDelta: number;
        maxPossible: number;
        evidenceIds: string[];
        evidenceChain: {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            transactionHashes: string[];
            ruleId: string;
            patternType: string;
            evidenceId: string;
            wallets: string[];
            entityName?: string | undefined;
            entityType?: string | undefined;
        }[];
    }, {
        id: string;
        name: string;
        category: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        scoreDelta: number;
        maxPossible: number;
        evidenceIds?: string[] | undefined;
        evidenceChain?: {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            ruleId: string;
            patternType: string;
            evidenceId: string;
            entityName?: string | undefined;
            entityType?: string | undefined;
            transactionHashes?: string[] | undefined;
            wallets?: string[] | undefined;
        }[] | undefined;
    }>, "many">;
    evidenceList: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    summary: z.ZodString;
    calculatedAt: z.ZodDate;
    recommendations: z.ZodArray<z.ZodString, "many">;
    confidence: z.ZodOptional<z.ZodObject<{
        confidenceScore: z.ZodNumber;
        confidenceLevel: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>;
        strengths: z.ZodArray<z.ZodString, "many">;
        limitations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        confidenceScore: number;
        confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        strengths: string[];
        limitations: string[];
    }, {
        confidenceScore: number;
        confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        strengths: string[];
        limitations: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    target: string;
    targetType: "txHash" | "address" | "cluster" | "transaction" | "investigation";
    overallScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    factors: {
        id: string;
        name: string;
        category: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        scoreDelta: number;
        maxPossible: number;
        evidenceIds: string[];
        evidenceChain: {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            transactionHashes: string[];
            ruleId: string;
            patternType: string;
            evidenceId: string;
            wallets: string[];
            entityName?: string | undefined;
            entityType?: string | undefined;
        }[];
    }[];
    evidenceList: string[];
    summary: string;
    calculatedAt: Date;
    recommendations: string[];
    confidence?: {
        confidenceScore: number;
        confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        strengths: string[];
        limitations: string[];
    } | undefined;
}, {
    target: string;
    targetType: "txHash" | "address" | "cluster" | "transaction" | "investigation";
    overallScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    factors: {
        id: string;
        name: string;
        category: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        scoreDelta: number;
        maxPossible: number;
        evidenceIds?: string[] | undefined;
        evidenceChain?: {
            timestamp: Date;
            confidence: number;
            explanation: string;
            severity: string;
            ruleId: string;
            patternType: string;
            evidenceId: string;
            entityName?: string | undefined;
            entityType?: string | undefined;
            transactionHashes?: string[] | undefined;
            wallets?: string[] | undefined;
        }[] | undefined;
    }[];
    summary: string;
    calculatedAt: Date;
    recommendations: string[];
    confidence?: {
        confidenceScore: number;
        confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        strengths: string[];
        limitations: string[];
    } | undefined;
    evidenceList?: string[] | undefined;
}>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export interface RiskEngineConfig {
    mixerInteractionWeight?: number;
    knownIllicitWeight?: number;
    scamInteractionWeight?: number;
    peelChainWeight?: number;
    rapidMovementWeight?: number;
    fanOutWeight?: number;
    fanInWeight?: number;
    crossChainBridgeWeight?: number;
    highHopWeight?: number;
    clusterAssociationWeight?: number;
}
//# sourceMappingURL=risk.d.ts.map