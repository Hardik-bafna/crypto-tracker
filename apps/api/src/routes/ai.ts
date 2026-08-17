import { FastifyPluginAsync } from "fastify";
import { AIQueryRequestSchema } from "@crypto-tracer/types";
import { InvestigationService } from "../services/investigation-service";
import { ToolDispatcher, AIInvestigator } from "@crypto-tracer/ai";

export function createAIRoutes(service: InvestigationService): FastifyPluginAsync {
  const toolDispatcher = new ToolDispatcher(
    service.getEntityDatabase(),
    service.getPatternEngine(),
    service.getClusterEngine(),
    service.getRiskEngine()
  );
  const investigator = new AIInvestigator(toolDispatcher);

  return async function (fastify) {
    fastify.post("/api/ai/query", async (req, reply) => {
      const parseResult = AIQueryRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid AI query request",
          details: parseResult.error.flatten(),
        });
      }

      const inv = service.getInvestigation(parseResult.data.investigationId);
      const response = await investigator.processQuery(parseResult.data, inv);

      return reply.send({ success: true, data: response });
    });
  };
}
