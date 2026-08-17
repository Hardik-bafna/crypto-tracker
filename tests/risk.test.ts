import { describe, it, expect } from "bun:test";
import { RiskEngine } from "@crypto-tracer/risk";
import { PatternEngine } from "@crypto-tracer/analysis";
import { EntityDatabase } from "@crypto-tracer/entities";
import { GraphBuilder } from "@crypto-tracer/graph";
import { SyntheticBlockchainAdapter } from "@crypto-tracer/blockchain";

describe("Risk Engine & Evidence Citations", () => {
  const entityDb = new EntityDatabase();
  const patternEngine = new PatternEngine(entityDb);
  const riskEngine = new RiskEngine();
  const synth = new SyntheticBlockchainAdapter("ethereum");
  const graph = GraphBuilder.buildFromTransactions(synth.getAllSyntheticTransactions());

  it("should evaluate suspect wallet with high/critical risk score and explainable factor breakdown", () => {
    const { patterns, evidence } = patternEngine.analyze(graph);
    const assessment = riskEngine.evaluate({
      target: "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001",
      patterns,
      evidence,
      nodes: graph.getAllNodes(),
    });

    expect(assessment.overallScore).toBeGreaterThanOrEqual(75);
    expect(assessment.riskLevel).toBe("CRITICAL");
    expect(assessment.factors.length).toBeGreaterThan(1);
    expect(assessment.recommendations.length).toBeGreaterThan(0);
    expect(assessment.factors.some((f) => f.id === "FACTOR_MIXER")).toBe(true);
  });
});
