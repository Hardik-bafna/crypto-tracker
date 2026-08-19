import { z } from "zod";
import { SuspiciousPatternTypeEnum } from "./analysis";
export const AlternativeExplanationItemSchema = z.object({
    label: z.string(),
    description: z.string(),
    likelihood: z.enum(["LOW", "MEDIUM", "HIGH"]),
    category: z.enum([
        "LEGITIMATE_BUSINESS",
        "DEFI_ACTIVITY",
        "PRIVACY",
        "OPERATIONAL",
        "REGULATORY",
    ]),
});
export const AlternativeExplanationSchema = z.object({
    id: z.string(),
    patternType: SuspiciousPatternTypeEnum,
    patternTitle: z.string(),
    suspiciousInterpretation: z.string(),
    alternativeExplanations: z.array(AlternativeExplanationItemSchema),
    investigatorGuidance: z.string(),
});
//# sourceMappingURL=alternative-explanations.js.map