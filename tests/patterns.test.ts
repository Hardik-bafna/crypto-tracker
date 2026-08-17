import { describe, it, expect } from "bun:test";
import { PatternEngine } from "@crypto-tracer/analysis";
import { EntityDatabase } from "@crypto-tracer/entities";
import { GraphBuilder } from "@crypto-tracer/graph";
import { SyntheticBlockchainAdapter } from "@crypto-tracer/blockchain";

describe("Suspicious Pattern Engine", () => {
  const entityDb = new EntityDatabase();
  const patternEngine = new PatternEngine(entityDb);
  const synth = new SyntheticBlockchainAdapter("ethereum");
  const graph = GraphBuilder.buildFromTransactions(synth.getAllSyntheticTransactions());

  it("should detect Mixer interactions and generate critical severity evidence", () => {
    const { patterns, evidence } = patternEngine.analyze(graph);
    const mixerPatterns = patterns.filter((p) => p.patternType === "MIXER_INTERACTION");

    expect(mixerPatterns.length).toBeGreaterThan(0);
    expect(mixerPatterns[0].severity).toBeGreaterThanOrEqual(90);
    expect(evidence.some((e) => e.type === "MIXER_INTERACTION")).toBe(true);
  });

  it("should detect Cross-Chain Bridge routing", () => {
    const { patterns } = patternEngine.analyze(graph);
    const bridgePatterns = patterns.filter((p) => p.patternType === "BRIDGE_INTERACTION");
    expect(bridgePatterns.length).toBeGreaterThan(0);
  });

  it("should detect Peel Chains in layered fund flows", () => {
    const { patterns } = patternEngine.analyze(graph);
    const peelPatterns = patterns.filter((p) => p.patternType === "PEEL_CHAIN");
    expect(peelPatterns.length).toBeGreaterThan(0);
  });

  it("should detect Rapid Velocity Fund Movement", () => {
    const { patterns } = patternEngine.analyze(graph);
    const rapidPatterns = patterns.filter((p) => p.patternType === "RAPID_MOVEMENT");
    expect(rapidPatterns.length).toBeGreaterThan(0);
  });

  it("should detect Fan-Out structuring", () => {
    const btcSynth = new SyntheticBlockchainAdapter("bitcoin");
    const btcGraph = GraphBuilder.buildFromTransactions(btcSynth.getAllSyntheticTransactions());
    const { patterns } = patternEngine.analyze(btcGraph);
    const fanOutPatterns = patterns.filter((p) => p.patternType === "FAN_OUT");
    expect(fanOutPatterns.length).toBeGreaterThan(0);
  });
});
