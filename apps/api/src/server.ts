import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { InvestigationService } from "./services/investigation-service";
import { createInvestigationRoutes } from "./routes/investigations";
import { createAIRoutes } from "./routes/ai";
import { createEntityRoutes } from "./routes/entities";
import { createBlockchainRoutes } from "./routes/blockchain";

export function buildServer(): { app: FastifyInstance; service: InvestigationService } {
  const app = Fastify({
    logger: true,
  });

  const service = new InvestigationService();

  // Register CORS
  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // Register Swagger documentation
  app.register(swagger, {
    openapi: {
      info: {
        title: "Cryptocurrency Forensic Tracing API",
        description: "Drug Law Enforcement Cryptocurrency Transaction Tracing & Intelligence API",
        version: "1.0.0",
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // Health check
  app.get("/health", async () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "crypto-tracer-api",
  }));

  // Register feature routes
  app.register(createInvestigationRoutes(service));
  app.register(createAIRoutes(service));
  app.register(createEntityRoutes(service));
  app.register(createBlockchainRoutes());

  return { app, service };
}
