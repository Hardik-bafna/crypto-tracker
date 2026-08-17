import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { buildServer } from "../apps/api/src/server.js";

describe("Fastify Investigation API Integration", () => {
  const { app } = buildServer();
  let baseUrl: string;

  beforeAll(async () => {
    const address = await app.listen({ port: 0, host: "127.0.0.1" });
    baseUrl = address;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health should return healthy status", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string };
    expect(json.status).toBe("healthy");
  });

  it("GET /api/demo/cases should return pre-loaded synthetic scenarios", async () => {
    const res = await fetch(`${baseUrl}/api/demo/cases`);
    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean; data: unknown[] };
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(3);
  });

  it("POST /api/investigations should create new investigation with graph and risk assessment", async () => {
    const res = await fetch(`${baseUrl}/api/investigations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001",
        chain: "ethereum",
        maxHops: 6,
        direction: "forward",
        title: "Test Narcotics Investigation",
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json() as { success: boolean; data: { id: string; risk: { overallScore: number } } };
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    expect(json.data.risk.overallScore).toBeGreaterThanOrEqual(75);
  });

  it("GET /api/investigations/:id/report should generate markdown report", async () => {
    // 1. Create investigation
    const createRes = await fetch(`${baseUrl}/api/investigations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001",
        chain: "ethereum",
        maxHops: 6,
      }),
    });
    const { data: inv } = await createRes.json() as { data: { id: string } };

    // 2. Fetch markdown report
    const reportRes = await fetch(`${baseUrl}/api/investigations/${inv.id}/report?format=markdown`);
    expect(reportRes.status).toBe(200);
    const text = await reportRes.text();
    expect(text).toContain("FORENSIC INVESTIGATION REPORT");
    expect(text).toContain("Risk Scoring");
  });
});
