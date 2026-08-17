import {
  AIToolName,
  NormalizedTransaction,
  GraphNode,
  GraphEdge,
  RiskAssessment,
  PatternDetectionResult,
  Evidence,
  WalletCluster,
  Entity,
  PathResult,
  AddressBalance,
} from "@crypto-tracer/types";
import { BlockchainAdapterFactory } from "@crypto-tracer/blockchain";
import { TransactionGraph, dijkstraShortestPath, nHopTraversal, GraphBuilder } from "@crypto-tracer/graph";
import { EntityDatabase } from "@crypto-tracer/entities";
import { PatternEngine } from "@crypto-tracer/analysis";
import { ClusterEngine } from "@crypto-tracer/clustering";
import { RiskEngine } from "@crypto-tracer/risk";

export class ToolDispatcher {
  constructor(
    private entityDb: EntityDatabase,
    private patternEngine: PatternEngine,
    private clusterEngine: ClusterEngine,
    private riskEngine: RiskEngine
  ) {}

  async executeTool(toolName: AIToolName, params: Record<string, unknown>, contextGraph?: TransactionGraph): Promise<unknown> {
    switch (toolName) {
      case "get_wallet": {
        const address = String(params.address || params.target || "").trim();
        const chain = String(params.chain || "ethereum");
        const adapter = BlockchainAdapterFactory.getAdapter(chain);
        const balance = await adapter.getBalance(address);
        const entityMatch = this.entityDb.getEntityByAddress(address);

        return {
          address,
          chain,
          balance: balance.formattedBalance,
          txCount: balance.txCount,
          isKnownEntity: !!entityMatch,
          entity: entityMatch ? { name: entityMatch.entity.name, type: entityMatch.entity.type, source: entityMatch.mapping.source } : null,
        };
      }

      case "get_transaction": {
        const txHash = String(params.txHash || params.hash || "").trim();
        const chain = String(params.chain || "ethereum");
        const adapter = BlockchainAdapterFactory.getAdapter(chain);
        const tx = await adapter.getTransaction(txHash);
        return tx || { error: "Transaction not found on public ledger." };
      }

      case "get_transactions": {
        const address = String(params.address || "").trim();
        const chain = String(params.chain || "ethereum");
        const limit = Number(params.limit || 20);
        const adapter = BlockchainAdapterFactory.getAdapter(chain);
        const txs = await adapter.getAddressTransactions(address, { limit });
        return txs;
      }

      case "trace_funds": {
        const address = String(params.address || params.target || "").trim();
        const chain = String(params.chain || "ethereum");
        const maxHops = Number(params.maxHops || 5);
        const direction = (String(params.direction || "forward")) as "forward" | "backward" | "both";

        const graph = contextGraph || (await GraphBuilder.ingestAndBuild(
          BlockchainAdapterFactory.getAdapter(chain),
          address,
          maxHops,
          direction
        ));

        const traversal = nHopTraversal(graph, address, { direction, maxHops });
        return {
          target: address,
          totalNodes: traversal.data.nodes.length,
          totalEdges: traversal.data.edges.length,
          totalVolume: traversal.totalVolume,
          maxHopReached: traversal.maxHopReached,
          nodes: traversal.data.nodes,
          edges: traversal.data.edges,
          hopStats: traversal.hopStats,
        };
      }

      case "find_path": {
        const source = String(params.source || params.from || "").trim();
        const target = String(params.target || params.to || "").trim();
        if (!contextGraph) {
          return { error: "Context graph required for path finding." };
        }
        const path = dijkstraShortestPath(contextGraph, source, target);
        return path || { message: "No connected fund transfer path identified between target addresses within graph bounds." };
      }

      case "find_entity": {
        const query = String(params.query || params.name || params.address || "").trim();
        if (query.startsWith("0x") || query.startsWith("bc1") || query.startsWith("1") || query.startsWith("3")) {
          const match = this.entityDb.getEntityByAddress(query);
          return match ? [match.entity] : [];
        }
        return this.entityDb.search(query);
      }

      case "get_cluster": {
        const address = String(params.address || "").trim();
        const chain = String(params.chain || "bitcoin");
        const adapter = BlockchainAdapterFactory.getAdapter(chain);
        const txs = await adapter.getAddressTransactions(address, { limit: 50 });
        const clusters = this.clusterEngine.clusterWallets(txs, chain);
        const matched = clusters.filter((c) => c.members.some((m) => m.toLowerCase() === address.toLowerCase()));
        return matched.length > 0 ? matched : clusters;
      }

      case "detect_patterns": {
        if (!contextGraph) {
          return { patterns: [], evidence: [] };
        }
        return this.patternEngine.analyze(contextGraph);
      }

      case "calculate_risk": {
        const target = String(params.target || params.address || "unknown");
        if (!contextGraph) {
          return { error: "Transaction graph required for risk calculation." };
        }
        const { patterns, evidence } = this.patternEngine.analyze(contextGraph);
        const assessment = this.riskEngine.evaluate({
          target,
          patterns,
          evidence,
          nodes: contextGraph.getAllNodes(),
        });
        return assessment;
      }

      case "get_evidence": {
        if (!contextGraph) {
          return [];
        }
        const { evidence } = this.patternEngine.analyze(contextGraph);
        const filterType = params.type ? String(params.type) : undefined;
        return filterType ? evidence.filter((e) => e.type === filterType) : evidence;
      }

      case "generate_report": {
        return { message: "Report generation invoked." };
      }

      default:
        return { error: `Unsupported tool: ${toolName}` };
    }
  }
}
