import { FastifyPluginAsync } from "fastify";
import { InvestigationService } from "../services/investigation-service.js";
import { EntityTypeEnum } from "@crypto-tracer/types";

export function createEntityRoutes(service: InvestigationService): FastifyPluginAsync {
  const entityDb = service.getEntityDatabase();

  return async function (fastify) {
    // Search entities
    fastify.get<{ Querystring: { q?: string; type?: string } }>("/api/entities/search", async (req, reply) => {
      const q = req.query.q || "";
      const type = req.query.type ? EntityTypeEnum.safeParse(req.query.type).data : undefined;
      const entities = entityDb.search(q, type);
      return reply.send({ success: true, count: entities.length, data: entities });
    });

    // Get entity by ID
    fastify.get<{ Params: { id: string } }>("/api/entities/:id", async (req, reply) => {
      const entity = entityDb.getEntityById(req.params.id);
      if (!entity) {
        return reply.status(404).send({ success: false, error: "Entity not found" });
      }
      return reply.send({ success: true, data: entity });
    });

    // Lookup address entity mapping
    fastify.get<{ Params: { address: string } }>("/api/entities/address/:address", async (req, reply) => {
      const match = entityDb.getEntityByAddress(req.params.address);
      if (!match) {
        return reply.send({ success: true, isKnown: false, data: null });
      }
      return reply.send({ success: true, isKnown: true, data: match.entity, mapping: match.mapping });
    });
  };
}
