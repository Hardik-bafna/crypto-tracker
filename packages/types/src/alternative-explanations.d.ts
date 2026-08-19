import { z } from "zod";
export declare const AlternativeExplanationItemSchema: z.ZodObject<{
    label: z.ZodString;
    description: z.ZodString;
    likelihood: z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>;
    category: z.ZodEnum<["LEGITIMATE_BUSINESS", "DEFI_ACTIVITY", "PRIVACY", "OPERATIONAL", "REGULATORY"]>;
}, "strip", z.ZodTypeAny, {
    label: string;
    category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
    description: string;
    likelihood: "LOW" | "MEDIUM" | "HIGH";
}, {
    label: string;
    category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
    description: string;
    likelihood: "LOW" | "MEDIUM" | "HIGH";
}>;
export type AlternativeExplanationItem = z.infer<typeof AlternativeExplanationItemSchema>;
export declare const AlternativeExplanationSchema: z.ZodObject<{
    id: z.ZodString;
    patternType: z.ZodEnum<["FAN_OUT", "FAN_IN", "RAPID_MOVEMENT", "PEEL_CHAIN", "HIGH_HOP_MOVEMENT", "MIXER_INTERACTION", "BRIDGE_INTERACTION", "ILLICIT_INTERACTION", "CIRCULAR_FLOW", "STRUCTURING"]>;
    patternTitle: z.ZodString;
    suspiciousInterpretation: z.ZodString;
    alternativeExplanations: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        description: z.ZodString;
        likelihood: z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>;
        category: z.ZodEnum<["LEGITIMATE_BUSINESS", "DEFI_ACTIVITY", "PRIVACY", "OPERATIONAL", "REGULATORY"]>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
        description: string;
        likelihood: "LOW" | "MEDIUM" | "HIGH";
    }, {
        label: string;
        category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
        description: string;
        likelihood: "LOW" | "MEDIUM" | "HIGH";
    }>, "many">;
    investigatorGuidance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    patternType: "FAN_OUT" | "FAN_IN" | "RAPID_MOVEMENT" | "PEEL_CHAIN" | "HIGH_HOP_MOVEMENT" | "MIXER_INTERACTION" | "BRIDGE_INTERACTION" | "ILLICIT_INTERACTION" | "CIRCULAR_FLOW" | "STRUCTURING";
    patternTitle: string;
    suspiciousInterpretation: string;
    alternativeExplanations: {
        label: string;
        category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
        description: string;
        likelihood: "LOW" | "MEDIUM" | "HIGH";
    }[];
    investigatorGuidance: string;
}, {
    id: string;
    patternType: "FAN_OUT" | "FAN_IN" | "RAPID_MOVEMENT" | "PEEL_CHAIN" | "HIGH_HOP_MOVEMENT" | "MIXER_INTERACTION" | "BRIDGE_INTERACTION" | "ILLICIT_INTERACTION" | "CIRCULAR_FLOW" | "STRUCTURING";
    patternTitle: string;
    suspiciousInterpretation: string;
    alternativeExplanations: {
        label: string;
        category: "LEGITIMATE_BUSINESS" | "DEFI_ACTIVITY" | "PRIVACY" | "OPERATIONAL" | "REGULATORY";
        description: string;
        likelihood: "LOW" | "MEDIUM" | "HIGH";
    }[];
    investigatorGuidance: string;
}>;
export type AlternativeExplanation = z.infer<typeof AlternativeExplanationSchema>;
//# sourceMappingURL=alternative-explanations.d.ts.map