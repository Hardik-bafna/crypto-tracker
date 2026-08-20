import {
  PatternDetectionResult,
  AlternativeExplanation,
  AlternativeExplanationItem,
  SuspiciousPatternType,
} from "@crypto-tracer/types";

/**
 * Deterministic engine that generates non-criminal alternative explanations
 * for detected suspicious patterns. No ML/LLM — uses a hardcoded rule map
 * of pattern types to known legitimate behaviors.
 */

type AltExplanationRule = {
  suspiciousInterpretation: string;
  alternatives: AlternativeExplanationItem[];
  guidance: string;
};

const EXPLANATION_RULES: Record<SuspiciousPatternType, AltExplanationRule> = {
  FAN_OUT: {
    suspiciousInterpretation:
      "Funds rapidly dispersed to many addresses, consistent with layering or mule-wallet distribution.",
    alternatives: [
      {
        label: "Payroll or Disbursement",
        description:
          "Business payroll systems, DAO contributor payments, or grant distributions often send funds to many wallets in a single batch.",
        likelihood: "MEDIUM",
        category: "LEGITIMATE_BUSINESS",
      },
      {
        label: "Airdrop Distribution",
        description:
          "Token airdrops or reward distributions send identical or varied amounts to hundreds of addresses in rapid succession.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Treasury Diversification",
        description:
          "DAO or fund treasuries diversify holdings across multiple wallets for security or multi-sig governance.",
        likelihood: "MEDIUM",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Verify whether the source wallet is associated with a known protocol, DAO, or payroll service. Check if recipient addresses share common traits (new wallets, similar balances).",
  },

  FAN_IN: {
    suspiciousInterpretation:
      "Multiple wallets consolidating into a single address, consistent with fund aggregation before cash-out.",
    alternatives: [
      {
        label: "Revenue Consolidation",
        description:
          "Merchants, exchanges, or services periodically sweep incoming payments from customer-facing deposit addresses into a central hot wallet.",
        likelihood: "HIGH",
        category: "LEGITIMATE_BUSINESS",
      },
      {
        label: "Staking or Pool Entry",
        description:
          "Users aggregate smaller holdings into a single wallet to meet minimum staking or liquidity pool thresholds.",
        likelihood: "MEDIUM",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Personal Wallet Consolidation",
        description:
          "Individual users consolidating funds from multiple personal wallets into a primary address for convenience.",
        likelihood: "MEDIUM",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Check whether the destination is a known exchange hot wallet or staking contract. Examine whether source addresses are linked by common funding patterns.",
  },

  RAPID_MOVEMENT: {
    suspiciousInterpretation:
      "Funds moved through intermediary addresses with minimal holding time, suggesting automated laundering.",
    alternatives: [
      {
        label: "Automated DeFi Yield Farming",
        description:
          "Yield farming bots rapidly move funds between lending pools, liquidity pairs, and vaults to maximize APY, creating rapid multi-hop patterns.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Arbitrage Bot",
        description:
          "MEV or cross-DEX arbitrage bots move funds through multiple contracts within seconds for profit. These are legitimate market-making activities.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Gas Optimization Routing",
        description:
          "Wallet software or aggregators may route through intermediate contracts for gas-efficient bundled transactions.",
        likelihood: "LOW",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Check if intermediary addresses are smart contracts (DEX routers, lending protocols). Bot activity typically interacts with verified contracts, not EOAs.",
  },

  PEEL_CHAIN: {
    suspiciousInterpretation:
      "Sequential transfers peeling small amounts from a bulk fund, classic layering technique to obscure origin.",
    alternatives: [
      {
        label: "Exchange Withdrawal Splitting",
        description:
          "Some exchanges split large withdrawals into smaller batches for internal risk management or UTXO management on Bitcoin.",
        likelihood: "MEDIUM",
        category: "OPERATIONAL",
      },
      {
        label: "Automated Payment Processing",
        description:
          "Payment processors batch and split disbursements to vendors or affiliates in sequential increments.",
        likelihood: "MEDIUM",
        category: "LEGITIMATE_BUSINESS",
      },
      {
        label: "Dollar-Cost Averaging Script",
        description:
          "Automated scripts executing periodic buys/transfers of fixed amounts from a larger pool.",
        likelihood: "LOW",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Examine the ratio of peeled amounts to the original balance. Legitimate splitting usually has consistent, round-number amounts rather than decreasing-remainder patterns.",
  },

  MIXER_INTERACTION: {
    suspiciousInterpretation:
      "Direct interaction with a known mixing or privacy protocol designed to break transaction linkability.",
    alternatives: [
      {
        label: "Legitimate Privacy Use",
        description:
          "Individuals in restrictive jurisdictions or public-facing roles may use privacy tools to protect salary details, donations, or personal transactions.",
        likelihood: "LOW",
        category: "PRIVACY",
      },
      {
        label: "Protocol Research / Testing",
        description:
          "Security researchers, auditors, or developers may interact with mixer contracts to test functionality or conduct audits.",
        likelihood: "LOW",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Mixer interaction is a strong indicator but not conclusive. Evaluate the volume, frequency, and whether the user has other privacy-seeking behaviors. Check if deposits correlate with known incident timelines.",
  },

  BRIDGE_INTERACTION: {
    suspiciousInterpretation:
      "Funds routed through a cross-chain bridge to migrate assets to a different blockchain, potentially to evade single-chain monitoring.",
    alternatives: [
      {
        label: "Cross-Chain Yield Optimization",
        description:
          "DeFi users routinely bridge assets to access higher yields, lower gas fees, or specific protocols on other chains (e.g., Arbitrum, Optimism, Polygon).",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Multi-Chain Portfolio Management",
        description:
          "Investors maintain positions across multiple chains for diversification and access to chain-specific ecosystems.",
        likelihood: "HIGH",
        category: "OPERATIONAL",
      },
      {
        label: "NFT or GameFi Migration",
        description:
          "Users bridge to specific chains to participate in NFT marketplaces or gaming ecosystems only available on those chains.",
        likelihood: "MEDIUM",
        category: "DEFI_ACTIVITY",
      },
    ],
    guidance:
      "Cross-chain bridging is extremely common in legitimate DeFi. Evaluate whether the destination chain activity is traceable. Flag only when combined with other risk indicators.",
  },

  HIGH_HOP_MOVEMENT: {
    suspiciousInterpretation:
      "Funds passed through many intermediate wallets to create distance from the original source.",
    alternatives: [
      {
        label: "Complex DeFi Route",
        description:
          "DEX aggregators (1inch, Paraswap, Zapper) often route trades through multiple intermediate contracts and pools to achieve optimal execution prices.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Multi-Protocol Strategy",
        description:
          "Leveraged yield strategies involve depositing into lending pools, borrowing, swapping, and re-depositing, which creates deep hop chains through legitimate protocols.",
        likelihood: "MEDIUM",
        category: "DEFI_ACTIVITY",
      },
    ],
    guidance:
      "Differentiate between hops through verified smart contracts (legitimate) vs. hops through ephemeral EOA wallets (suspicious). Contract-to-contract hops are typically legitimate routing.",
  },

  ILLICIT_INTERACTION: {
    suspiciousInterpretation:
      "Direct transaction with an address flagged by law enforcement or sanctions lists.",
    alternatives: [
      {
        label: "Shared Pool / DEX Contamination",
        description:
          "AMM liquidity pools (Uniswap, Curve) commingle funds from all depositors. Withdrawing from a pool that an illicit actor also used does not imply a direct relationship.",
        likelihood: "MEDIUM",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Accidental Interaction",
        description:
          "Users may unknowingly send to or receive from a flagged address, especially via intermediary services that were later sanctioned.",
        likelihood: "LOW",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Distinguish between direct peer-to-peer transfers (stronger evidence) and indirect exposure through shared smart contracts or services (weaker evidence). Verify temporal proximity to the flagging date.",
  },

  CIRCULAR_FLOW: {
    suspiciousInterpretation:
      "Funds returning to or near the origin address through a cycle, suggesting wash trading or layering.",
    alternatives: [
      {
        label: "Liquidity Provision Cycle",
        description:
          "Adding and removing liquidity from AMM pools creates circular flow patterns: deposit token A + B → receive LP token → remove liquidity → receive A + B back.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Flash Loan Execution",
        description:
          "Flash loans are borrowed and repaid within a single transaction, creating perfect circular flows that are a standard DeFi primitive.",
        likelihood: "HIGH",
        category: "DEFI_ACTIVITY",
      },
      {
        label: "Self-Transfer or Wallet Migration",
        description:
          "Users moving funds between their own wallets (e.g., from hot to cold and back) can create circular patterns.",
        likelihood: "MEDIUM",
        category: "OPERATIONAL",
      },
    ],
    guidance:
      "Check if the circular flow involves smart contracts (likely DeFi) or only EOA addresses (more suspicious). Flash loans always settle in one block.",
  },

  STRUCTURING: {
    suspiciousInterpretation:
      "Transactions structured to stay below reporting thresholds or split in ways consistent with smurfing.",
    alternatives: [
      {
        label: "Gas-Efficient Batched Transfers",
        description:
          "Wallets may split large transfers into smaller batches to manage gas price spikes or ensure individual transactions confirm reliably.",
        likelihood: "MEDIUM",
        category: "OPERATIONAL",
      },
      {
        label: "Exchange Deposit Limits",
        description:
          "Users subject to daily deposit limits on exchanges may naturally split transfers across multiple transactions.",
        likelihood: "MEDIUM",
        category: "REGULATORY",
      },
      {
        label: "Dollar-Cost Averaging",
        description:
          "Regular, fixed-amount purchases or transfers as part of an investment strategy.",
        likelihood: "MEDIUM",
        category: "LEGITIMATE_BUSINESS",
      },
    ],
    guidance:
      "Evaluate whether amounts cluster suspiciously around common reporting thresholds ($10,000, €15,000). Legitimate batching typically uses round numbers without threshold-avoidance patterns.",
  },
};

export class AlternativeExplanationEngine {
  /**
   * Analyze detected patterns and produce alternative (non-criminal)
   * explanations for each. Pure deterministic mapping — no ML/LLM.
   */
  static analyze(patterns: PatternDetectionResult[]): AlternativeExplanation[] {
    const results: AlternativeExplanation[] = [];
    const seenTypes = new Set<string>();

    for (const pattern of patterns) {
      // One alternative-explanation entry per unique pattern type
      const key = `${pattern.patternType}-${pattern.ruleId}`;
      if (seenTypes.has(key)) continue;
      seenTypes.add(key);

      const rule = EXPLANATION_RULES[pattern.patternType];
      if (!rule) continue;

      results.push({
        id: `alt-${pattern.ruleId}`,
        patternType: pattern.patternType,
        patternTitle: pattern.title,
        suspiciousInterpretation: rule.suspiciousInterpretation,
        alternativeExplanations: rule.alternatives,
        investigatorGuidance: rule.guidance,
      });
    }

    return results;
  }
}
