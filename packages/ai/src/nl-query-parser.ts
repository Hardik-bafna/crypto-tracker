import { AIToolCall } from "@crypto-tracer/types";

export class NLQueryParser {
  static parseQuery(query: string, defaultTarget?: string, defaultChain: string = "ethereum"): AIToolCall[] {
    const q = query.toLowerCase().trim();
    const calls: AIToolCall[] = [];

    // Extract potential addresses or tx hashes in query
    const ethAddrMatch = query.match(/0x[a-fA-F0-9]{40}/);
    const btcAddrMatch = query.match(/(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})/i);
    const txMatch = query.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/);

    const target = ethAddrMatch ? ethAddrMatch[0] : btcAddrMatch ? btcAddrMatch[0] : txMatch ? txMatch[0] : defaultTarget;
    const chain = btcAddrMatch ? "bitcoin" : defaultChain;

    // 1. Mixer interactions
    if (q.includes("mixer") || q.includes("tornado") || q.includes("privacy pool") || q.includes("anonymiz")) {
      calls.push({
        tool: "detect_patterns",
        parameters: { target, chain, filter: "MIXER_INTERACTION" },
        reasoning: "User asked for mixer/privacy pool interactions; invoking pattern engine.",
      });
      calls.push({
        tool: "get_evidence",
        parameters: { type: "MIXER_INTERACTION" },
        reasoning: "Retrieving verified evidentiary records for identified mixer deposits/withdrawals.",
      });
      return calls;
    }

    // 2. First known exchange / where funds end up
    if (q.includes("exchange") || q.includes("end up") || q.includes("cashout") || q.includes("binance") || q.includes("coinbase") || q.includes("kraken")) {
      calls.push({
        tool: "find_entity",
        parameters: { query: "EXCHANGE" },
        reasoning: "Identifying labeled exchange deposit addresses across transaction path.",
      });
      calls.push({
        tool: "trace_funds",
        parameters: { target, chain, maxHops: 8, direction: "forward" },
        reasoning: "Tracing downstream fund flow to locate exchange cashout touchpoints.",
      });
      return calls;
    }

    // 3. Risk explanation / why score is high
    if (q.includes("risk") || q.includes("score") || q.includes("why") || q.includes("suspicious") || q.includes("flag")) {
      calls.push({
        tool: "calculate_risk",
        parameters: { target, chain },
        reasoning: "Calculating transparent deterministic risk score and extracting contributing factor breakdown.",
      });
      calls.push({
        tool: "get_evidence",
        parameters: {},
        reasoning: "Retrieving forensic evidence ledger backing the risk score.",
      });
      return calls;
    }

    // 4. Cluster / Co-ownership
    if (q.includes("cluster") || q.includes("co-own") || q.includes("related wallet") || q.includes("multi-input")) {
      calls.push({
        tool: "get_cluster",
        parameters: { address: target, chain },
        reasoning: "Applying common-input and change-address heuristics to discover co-owned wallet cluster.",
      });
      return calls;
    }

    // 5. Explicit trace forward / backward
    if (q.includes("trace") || q.includes("hop") || q.includes("flow") || q.includes("follow")) {
      const hopMatch = q.match(/(\d+)\s*hop/);
      const maxHops = hopMatch ? parseInt(hopMatch[1], 10) : 6;
      const direction = q.includes("backward") || q.includes("inbound") ? "backward" : "forward";

      calls.push({
        tool: "trace_funds",
        parameters: { target, chain, maxHops, direction },
        reasoning: `Executing ${direction} multi-hop graph traversal across ${maxHops} hops.`,
      });
      return calls;
    }

    // 6. Report generation
    if (q.includes("report") || q.includes("export") || q.includes("summary") || q.includes("dossier")) {
      calls.push({
        tool: "generate_report",
        parameters: { target, chain },
        reasoning: "Synthesizing comprehensive evidence-backed investigation report.",
      });
      return calls;
    }

    // Default fallback: general wallet & risk lookup
    calls.push({
      tool: "get_wallet",
      parameters: { address: target, chain },
      reasoning: "Looking up basic wallet balance and entity labeling metadata.",
    });
    calls.push({
      tool: "calculate_risk",
      parameters: { target, chain },
      reasoning: "Evaluating forensic risk indicators for target address.",
    });

    return calls;
  }
}
