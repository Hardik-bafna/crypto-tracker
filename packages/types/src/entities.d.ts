import { z } from "zod";
export declare const EntityTypeEnum: z.ZodEnum<["EXCHANGE", "MIXER", "BRIDGE", "MARKETPLACE", "GAMBLING", "SCAM", "KNOWN_ILLICIT", "SERVICE", "UNKNOWN"]>;
export type EntityType = z.infer<typeof EntityTypeEnum>;
export declare const EntityConfidenceEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>;
export type EntityConfidence = z.infer<typeof EntityConfidenceEnum>;
export declare const EntityAddressMappingSchema: z.ZodObject<{
    address: z.ZodString;
    chain: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    confidence: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>>;
    source: z.ZodString;
    lastVerified: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    address: string;
    chain: string;
    source: string;
    confidence: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    lastVerified: Date;
    label?: string | undefined;
}, {
    address: string;
    chain: string;
    source: string;
    lastVerified: Date;
    label?: string | undefined;
    confidence?: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED" | undefined;
}>;
export type EntityAddressMapping = z.infer<typeof EntityAddressMappingSchema>;
export declare const EntitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["EXCHANGE", "MIXER", "BRIDGE", "MARKETPLACE", "GAMBLING", "SCAM", "KNOWN_ILLICIT", "SERVICE", "UNKNOWN"]>;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    addresses: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        chain: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        confidence: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>>;
        source: z.ZodString;
        lastVerified: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        address: string;
        chain: string;
        source: string;
        confidence: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        lastVerified: Date;
        label?: string | undefined;
    }, {
        address: string;
        chain: string;
        source: string;
        lastVerified: Date;
        label?: string | undefined;
        confidence?: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED" | undefined;
    }>, "many">;
    confidence: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "VERIFIED"]>;
    source: z.ZodString;
    lastVerified: z.ZodDate;
    website: z.ZodOptional<z.ZodString>;
    jurisdiction: z.ZodOptional<z.ZodString>;
    isKycCompliant: z.ZodOptional<z.ZodBoolean>;
    baseRiskScore: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "EXCHANGE" | "MIXER" | "BRIDGE" | "MARKETPLACE" | "GAMBLING" | "SCAM" | "KNOWN_ILLICIT" | "SERVICE" | "UNKNOWN";
    id: string;
    source: string;
    confidence: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    lastVerified: Date;
    name: string;
    addresses: {
        address: string;
        chain: string;
        source: string;
        confidence: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
        lastVerified: Date;
        label?: string | undefined;
    }[];
    baseRiskScore: number;
    category?: string | undefined;
    description?: string | undefined;
    website?: string | undefined;
    jurisdiction?: string | undefined;
    isKycCompliant?: boolean | undefined;
}, {
    type: "EXCHANGE" | "MIXER" | "BRIDGE" | "MARKETPLACE" | "GAMBLING" | "SCAM" | "KNOWN_ILLICIT" | "SERVICE" | "UNKNOWN";
    id: string;
    source: string;
    confidence: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED";
    lastVerified: Date;
    name: string;
    addresses: {
        address: string;
        chain: string;
        source: string;
        lastVerified: Date;
        label?: string | undefined;
        confidence?: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED" | undefined;
    }[];
    category?: string | undefined;
    description?: string | undefined;
    website?: string | undefined;
    jurisdiction?: string | undefined;
    isKycCompliant?: boolean | undefined;
    baseRiskScore?: number | undefined;
}>;
export type Entity = z.infer<typeof EntitySchema>;
export declare const AttributionTypeEnum: z.ZodEnum<["OBSERVED", "INFERENCE", "ATTRIBUTION"]>;
export type AttributionType = z.infer<typeof AttributionTypeEnum>;
export declare const AttributionItemSchema: z.ZodObject<{
    address: z.ZodString;
    entityId: z.ZodOptional<z.ZodString>;
    entityName: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodEnum<["EXCHANGE", "MIXER", "BRIDGE", "MARKETPLACE", "GAMBLING", "SCAM", "KNOWN_ILLICIT", "SERVICE", "UNKNOWN"]>>;
    attributionType: z.ZodEnum<["OBSERVED", "INFERENCE", "ATTRIBUTION"]>;
    confidence: z.ZodNumber;
    explanation: z.ZodString;
    supportingEvidenceIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    address: string;
    confidence: number;
    attributionType: "OBSERVED" | "INFERENCE" | "ATTRIBUTION";
    explanation: string;
    supportingEvidenceIds: string[];
    entityId?: string | undefined;
    entityName?: string | undefined;
    entityType?: "EXCHANGE" | "MIXER" | "BRIDGE" | "MARKETPLACE" | "GAMBLING" | "SCAM" | "KNOWN_ILLICIT" | "SERVICE" | "UNKNOWN" | undefined;
}, {
    address: string;
    confidence: number;
    attributionType: "OBSERVED" | "INFERENCE" | "ATTRIBUTION";
    explanation: string;
    supportingEvidenceIds: string[];
    entityId?: string | undefined;
    entityName?: string | undefined;
    entityType?: "EXCHANGE" | "MIXER" | "BRIDGE" | "MARKETPLACE" | "GAMBLING" | "SCAM" | "KNOWN_ILLICIT" | "SERVICE" | "UNKNOWN" | undefined;
}>;
export type AttributionItem = z.infer<typeof AttributionItemSchema>;
//# sourceMappingURL=entities.d.ts.map