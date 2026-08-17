import { FastifyPluginAsync } from "fastify";
import { CreateInvestigationRequestSchema } from "@crypto-tracer/types";
import { InvestigationService } from "../services/investigation-service.js";
import { SYNTHETIC_DEMO_CASES } from "@crypto-tracer/blockchain";

export function createInvestigationRoutes(service: InvestigationService): FastifyPluginAsync {
  return async function (fastify) {
    // List demo cases
    fastify.get("/api/demo/cases", async (_req, reply) => {
      return reply.send({ success: true, data: SYNTHETIC_DEMO_CASES });
    });

    // List all investigations
    fastify.get("/api/investigations", async (_req, reply) => {
      const investigations = service.getAllInvestigations();
      return reply.send({
        success: true,
        count: investigations.length,
        data: investigations.map((inv) => ({
          id: inv.id,
          title: inv.title,
          target: inv.target,
          targetType: inv.targetType,
          chain: inv.chain,
          riskScore: inv.stats?.riskScore ?? 0,
          totalNodes: inv.stats?.totalNodes ?? 0,
          totalEdges: inv.stats?.totalEdges ?? 0,
          createdAt: inv.createdAt,
          caseNumber: inv.caseNumber,
        })),
      });
    });

    // Create new investigation
    fastify.post("/api/investigations", async (req, reply) => {
      const parseResult = CreateInvestigationRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "Invalid investigation request parameters",
          details: parseResult.error.flatten(),
        });
      }

      const investigation = await service.createInvestigation(parseResult.data);
      return reply.status(201).send({ success: true, data: investigation });
    });

    // Get investigation by ID
    fastify.get<{ Params: { id: string } }>("/api/investigations/:id", async (req, reply) => {
      const inv = service.getInvestigation(req.params.id);
      if (!inv) {
        return reply.status(404).send({ success: false, error: "Investigation not found" });
      }
      return reply.send({ success: true, data: inv });
    });

    // Trace investigation with custom filters
    fastify.post<{ Params: { id: string }; Body: { maxHops?: number; direction?: "forward" | "backward" | "both"; minAmount?: string; asset?: string } }>(
      "/api/investigations/:id/trace",
      async (req, reply) => {
        const graphData = service.traceInvestigation(req.params.id, req.body || {});
        if (!graphData) {
          return reply.status(404).send({ success: false, error: "Investigation or graph not found" });
        }
        return reply.send({ success: true, data: graphData });
      }
    );

    // Get graph for visualization
    fastify.get<{ Params: { id: string } }>("/api/investigations/:id/graph", async (req, reply) => {
      const inv = service.getInvestigation(req.params.id);
      if (!inv || !inv.graph) {
        return reply.status(404).send({ success: false, error: "Investigation or graph not found" });
      }
      return reply.send({ success: true, data: inv.graph });
    });

    // Get evidence items
    fastify.get<{ Params: { id: string } }>("/api/investigations/:id/evidence", async (req, reply) => {
      const inv = service.getInvestigation(req.params.id);
      if (!inv) {
        return reply.status(404).send({ success: false, error: "Investigation not found" });
      }
      return reply.send({ success: true, data: inv.evidence || [] });
    });

    // Get risk score assessment
    fastify.get<{ Params: { id: string } }>("/api/investigations/:id/risk", async (req, reply) => {
      const inv = service.getInvestigation(req.params.id);
      if (!inv || !inv.risk) {
        return reply.status(404).send({ success: false, error: "Risk assessment not available" });
      }
      return reply.send({ success: true, data: inv.risk });
    });

    // Get investigation report (JSON & Markdown)
    fastify.get<{ Params: { id: string }; Querystring: { format?: "json" | "markdown" } }>(
      "/api/investigations/:id/report",
      async (req, reply) => {
        const format = req.query.format || "json";
        if (format === "markdown") {
          const md = service.getMarkdownReport(req.params.id);
          if (!md) return reply.status(404).send({ success: false, error: "Report not found" });
          reply.header("Content-Type", "text/markdown");
          return reply.send(md);
        }

        const report = service.getReport(req.params.id);
        if (!report) return reply.status(404).send({ success: false, error: "Report not found" });
        return reply.send({ success: true, data: report });
      }
    );
  };
}
