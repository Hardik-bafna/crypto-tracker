# CryptoTrace™ | Anti-Narcotics Cryptocurrency Forensic Tracing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun%201.3-black.svg)](https://bun.sh/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Backend-Fastify%204-green.svg)](https://fastify.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A specialized blockchain forensic intelligence platform engineered for **Drug Law Enforcement Agencies (NCB, DEA, Special Task Forces)** to trace cryptocurrency transaction trails, penetrate mixer and bridge obfuscation layers, cluster laundering syndicates, and **unmask the real human receivers of illicit drug proceeds** at regulated cashout endpoints.

---

## 🎯 Problem Statement & Operational Objective

### Background
Cryptocurrencies (Bitcoin, USDT, Ethereum, Monero) are increasingly exploited by narcotics syndicates on the Darknet, Telegram, and encrypted messaging channels to collect drug sale proceeds and store illicit wealth.

### The Challenge
Drug proceeds are rarely sent directly to personal bank accounts. Instead, traffickers route funds through:
- **Privacy Pools / Tumblers / Mixers** (Tornado Cash, Wasabi/CoinJoin, ChipMixer) to break on-chain lineage.
- **Cross-Chain Bridges** (Synapse, Across, Hop, Stargate) to hop blockchains and evade single-chain tracking.
- **Peel Chains & Smurfing Mules** to strip transaction fees and layer proceeds into smaller tranches.

### The Solution
CryptoTrace™ follows the transaction trail forward from initial suspect deposits or backward from seized transaction hashes to the **ultimate cashout endpoints (KYC-regulated Centralized Exchanges)**. It generates court-admissible forensic dossiers and statutory subpoena checklists (**Section 67 NDPS Act / 91 CrPC / 18 U.S.C. § 2703(d)**) to freeze accounts and compel exchange disclosures.

---

## ⚡ Key Capabilities

### 1. Dual Ingestion Modes
- **🔴 Live Mainnet Investigation**:
  - Direct live scanning from public block explorers (**Blockstream API** for Bitcoin, **Blockscout v2 API** for Ethereum & USDT).
  - Strict input validation for **Wallet Addresses** (Base58, Bech32, EVM hex) and **Transaction Hashes** (64/66 hex).
  - Explicit error handling for unindexed/empty addresses with zero mock data fallback in live mode.
- **🔵 Forensic Demo Scenarios**:
  - Pre-loaded synthetic case files simulating complex narcotics syndicate operations:
    1. **Operation Silk Trail**: Darknet fentanyl vendor $\rightarrow$ Peel chain $\rightarrow$ Tornado Cash 100 ETH pool $\rightarrow$ Synapse bridge $\rightarrow$ Binance KYC cashout deposit.
    2. **Operation Hydra Flow**: Cartel Bitcoin vault $\rightarrow$ 1-to-8 mule fan-out structuring $\rightarrow$ High-hop aggregation.
    3. **Operation Phantom Vault**: Layered $500,000 USDT structuring and cross-contract routing.

### 2. Multi-Asset Blockchain Engine
- **Bitcoin (BTC)**: Native UTXO graph reconstruction, multi-input co-spent clustering (CIOH), and change address detection.
- **Ethereum (ETH)**: Direct account-to-account value transfers and internal contract call parsing.
- **Tether (USDT)**: ERC-20 / Smart contract transfer log normalization with exact decimal formatting.
- **Monero (XMR)**: Privacy guardrail providing statutory traceability notices and alternative countermeasure workflows.

### 3. Forensic Suspicious Pattern Engine (7 Rule Detectors)
1. **Mixer / Tumbler Interaction**: OFAC-sanctioned smart contracts (Tornado Cash, Blender, ChipMixer).
2. **Cross-Chain Bridges**: Token bridging and chain-hopping protocols (Synapse, Stargate, Across).
3. **Peel Chains**: Automated value-stripping chains passing dominant balances through unhosted intermediaries.
4. **Fan-Out (Smurfing)**: 1-to-N dispersal of large drug proceeds across multiple mule wallets.
5. **Fan-In (Consolidation)**: N-to-1 aggregation of smurfed balances prior to liquidation.
6. **Rapid Velocity Transit**: Hops occurring within < 30 minutes, indicating automated laundering scripts.
7. **High-Hop Layering**: Deep intermediary routing ($\ge$ 4 hops) designed to exhaust manual investigators.

### 4. Entity Intelligence & Real Receiver Identification
- **Attribution Database**: Curated dataset of verified entities (Exchanges, Mixers, Bridges, Darknet Narcotics targets).
- **Three-Tier Legal Distinction**:
  - **Observed Facts**: Immutable mathematical transactions recorded on the public ledger.
  - **Analytical Inferences**: Pattern-derived deductions regarding laundering intent.
  - **Entity Attributions**: Confidence-weighted matches to known real-world services.
- **Cashout Endpoint Identification**: Highlights KYC-compliant exchange deposit addresses (e.g. Binance, Kraken, Coinbase, CoinDCX) where fiat off-ramping occurs.

### 5. Deterministic Risk Assessment
- Calibrated 0–100 risk score (**LOW**, **MEDIUM**, **HIGH**, **CRITICAL**).
- Explainable scoring breakdown detailing exact point additions with cited Evidence IDs.
- Court-verifiable cryptographic proofs linked to specific block numbers and transaction hashes.

### 6. Judicial Evidentiary Dossier & Subpoena Generator
- Exportable formal Law Enforcement Investigation Reports (Markdown / JSON).
- Statutory Subpoena Checklist for investigators specifying:
  - **Target Entity**: Exchange Compliance / LE Response Unit.
  - **Statutory Authority**: Section 67 NDPS Act / Section 91 CrPC / 18 U.S.C. § 2703(d).
  - **Specific Records to Compel**: Customer Identification Program (CIP/KYC) documents, linked bank account numbers/wires, and login IP audit trails.

### 7. AI Forensic Copilot
- Natural language query parser with tool execution transparency.
- Answers complex queries such as:
  - *"Where did these funds eventually end up?"*
  - *"Which exchange received the cashout?"*
  - *"Explain the mixer interaction and cited evidence"*

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, React Flow, Tailwind CSS, Lucide Icons |
| **Backend** | Fastify 4, TypeScript, Zod Schema Validation, OpenAPI / Swagger |
| **Blockchain** | Blockstream REST API, Blockscout v2 API, Web3 / Ethers primitives |
| **Algorithms** | Graphology, Custom Dijkstra Shortest Path, BFS/DFS Bounded Hops |
| **Runtime / Env** | Bun 1.3, Nix Flakes, Direnv |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.3+ recommended) or [Nix](https://nixos.org/) with Flakes enabled.
- Node.js v20+

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Hardik-bafna/narabsdk.git
cd narabsdk
make install
```

### Running the Application
Start both the Fastify backend (Port 3001) and Next.js frontend (Port 3000) simultaneously:
```bash
make dev
```

The services will be available at:
- **Forensic Web Visualizer**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:3001`
- **Swagger API Documentation**: `http://localhost:3001/docs`

---

## 🧪 Testing & Verification

Run the comprehensive unit and integration test suite (26+ test cases across 7 packages):
```bash
make test
```

### Test Coverage Highlights
- ✅ **`tests/patterns.test.ts`**: Verifies Mixer, Bridge, Peel Chain, Rapid Velocity, and Fan-Out detection.
- ✅ **`tests/blockchain.test.ts`**: Tests Bitcoin Legacy/Bech32/UTXO parsing, Ethereum addresses, and USDT ERC-20 token logs.
- ✅ **`tests/graph.test.ts`**: Verifies BFS/DFS traversal, Dijkstra shortest path to cashout exchange, and minimum amount filtering.
- ✅ **`tests/risk.test.ts`**: Evaluates deterministic scoring and factor delta breakdowns.
- ✅ **`tests/clustering.test.ts`**: Tests Bitcoin Common-Input Ownership Heuristic (CIOH).
- ✅ **`tests/ai.test.ts`**: Tests natural language query parser and tool dispatcher.
- ✅ **`tests/api.test.ts`**: End-to-end integration tests for Fastify REST endpoints.

---

## 📂 Repository Structure

```
narabsdk/
├── Makefile                    # Developer automation scripts (dev, test, build, install)
├── flake.nix                   # Nix reproducible development shell
├── docker-compose.yml          # Containerized deployment specification
├── apps/
│   ├── web/                    # Next.js visualizer, Omnibar, GraphCanvas, InspectorDrawer
│   │   ├── app/                # Main application page and layout
│   │   ├── components/         # React Flow canvas, RiskMeter, EvidencePanel, ReportModal
│   │   └── lib/                # API client & offline local investigation store
│   └── api/                    # Fastify API server & investigation controller
│       ├── src/routes/         # REST endpoints (/api/investigations, /api/demo/cases)
│       └── src/services/       # Investigation service orchestration
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & Zod schemas
│   ├── blockchain/             # Bitcoin, Ethereum, ERC-20, Monero & Synthetic adapters
│   ├── graph/                  # Directed weighted multi-graph model & traversal algorithms
│   ├── analysis/               # 7 Suspicious pattern detection rule engines
│   ├── entities/               # Labeled entity database & attribution engine
│   ├── clustering/             # Multi-input CIOH & change address clustering
│   ├── risk/                   # Deterministic 0-100 risk scoring & evidence engine
│   └── ai/                     # NL query parser, tool dispatcher & dossier generator
└── tests/                      # Monorepo test suites
```

---

## ⚖️ Legal & Statutory Disclaimers

1. **Law Enforcement Use**: This software is designed for authorized intelligence gathering and evidentiary preparation by Drug Law Enforcement Agencies.
2. **Attribution Standards**: Blockchain analysis establishes cryptographic co-control and fund lineage between addresses. Direct natural person identification requires serving statutory notices (e.g., Section 67 NDPS Act / 18 U.S.C. § 2703(d)) on destination centralized exchanges to compel KYC records.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
