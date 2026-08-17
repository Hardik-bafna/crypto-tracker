import { describe, it, expect } from "bun:test";
import { NLQueryParser, ToolDispatcher, AIInvestigator } from "@crypto-tracer/ai";
import { EntityDatabase } from "@crypto-tracer/entities";
import { PatternEngine } from "@crypto-tracer/analysis";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { RiskEngine } from "@crypto-tracer/risk";

describe("AI Natural Language Copilot & Tool Dispatcher", () => {
  const entityDb = new EntityDatabase();
  const patternEngine = new PatternEngine(entityDb);
  const clusterEngine = new ClusterEngine();
  const riskEngine = new RiskEngine();
  const dispatcher = new ToolDispatcher(entityDb, patternEngine, clusterEngine, riskEngine);
  const investigator = new AIInvestigator(dispatcher);

  it("should parse natural language query into deterministic tool calls", () => {
    const calls = NLQueryParser.parseQuery("Trace this wallet forward 8 hops: 0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001");
    expect(calls.some((c) => c.tool === "trace_funds")).toBe(true);
    const traceCall = calls.find((c) => c.tool === "trace_funds");
    expect(traceCall?.parameters.maxHops).toBe(8);
  });

  it("should respond to natural language questions with evidence citations and disclaimers", async () => {
    const res = await investigator.processQuery({
      investigationId: "inv-test",
      query: "Explain why this wallet has a high risk score",
    });

    expect(res.answer).toContain("Risk");
    expect(res.confidence).toBeGreaterThan(0.9);
    expect(res.disclaimers.length).toBeGreaterThan(0);
  });

  it("should respond to mixer queries with Tornado Cash evidence citations", async () => {
    const res = await investigator.processQuery({
      investigationId: "inv-test",
      query: "Find interactions with mixers and privacy pools",
    });

    expect(res.answer).toContain("Tornado Cash");
    expect(res.confidence).toBeGreaterThan(0.9);
  });
});
