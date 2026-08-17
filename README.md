# CryptoTrace™ | Cryptocurrency Forensic Intelligence & Tracing System

A specialized software platform for authorized drug-law-enforcement investigators to trace cryptocurrency fund flows, detect suspicious transaction patterns, cluster related wallets, calculate explainable risk scores, and generate judicial-grade investigation dossiers.

---

## Key Features

1. **Deterministic Multi-Graph Engine**:
   - Directed weighted multi-graph representation of cryptocurrency transfers.
   - Algorithms: BFS, DFS path finding, Dijkstra shortest path, connected components, and bounded N-hop traversal.
   - Preserves UTXO inputs/outputs for Bitcoin and internal/ERC-20 token logs for Ethereum (USDT/USDC).

2. **Forensic Suspicious Pattern Detection**:
   - **Fan-Out**: Rapid fund dispersal to multiple recipient addresses (structuring/smurfing).
   - **Fan-In**: Aggregated consolidation from multiple mule wallets.
   - **Peel Chain**: Layered transactions peeling off fees while forwarding the dominant balance.
   - **Rapid Movement**: Automated or high velocity transfers (< 30 minutes holding time).
   - **High-Hop Layering**: Deep intermediary routing to obfuscate origins.
   - **Mixer / Privacy Pool Interaction**: Verified interactions with Tornado Cash, Blender.io, etc.
   - **Cross-Chain Bridge Routing**: Chain-hopping evasion through Synapse, Stargate, etc.

3. **Entity Intelligence & Attribution**:
   - Curated dataset of verified exchanges, mixers, bridges, and law-enforcement flagged darknet narcotics targets.
   - Strict distinction between **OBSERVED FACTS**, **INFERENCES**, and **ATTRIBUTIONS**.

4. **Wallet Clustering**:
   - Bitcoin Common-Input Ownership Heuristic (CIOH).
   - Change address identification (round payment amounts vs non-round remainder).
   - Temporal co-activity correlation.

5. **Deterministic Explainable Risk Engine**:
   - 0–100 calibrated risk scoring (LOW, MEDIUM, HIGH, CRITICAL).
   - Immutable evidence ledger with Evidence IDs linked to transaction hashes and addresses.

6. **AI Investigation Copilot**:
   - Natural language query parser with strict guardrails (never invents transactions or identities).
   - Instant subpoena recommendation generation for centralized exchanges.

7. **Interactive Visualizer**:
   - React Flow canvas with custom nodes, animated edges, minimap, inspector drawers, timeline, and report export.

---

## Development Setup

### Using Nix Flake
The repository includes a `flake.nix` environment configured with Bun, Node.js 22, pnpm, and Git.

```bash
# Enter the Nix development shell
nix develop

# Or with direnv
direnv allow
```

### Running Tests
```bash
# Run all unit and integration tests with Bun
bun test
```

### Starting the Application

```bash
# Start Fastify Backend API (Port 3001)
bun run --filter @crypto-tracer/api dev

# Start Next.js Frontend Visualizer (Port 3000)
bun run --filter @crypto-tracer/web dev
```

---

## Monorepo Architecture

```
narabsdk/
├── apps/
│   ├── web/                    # Next.js 14 + React Flow + Tailwind CSS
│   └── api/                    # Fastify REST & WebSocket API
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & Zod schemas
│   ├── blockchain/             # Bitcoin, Ethereum, ERC-20, Synthetic & Monero adapters
│   ├── graph/                  # Multi-graph model & deterministic algorithms
│   ├── analysis/               # Suspicious pattern detection engine
│   ├── entities/               # Labeled intelligence database & attribution
│   ├── clustering/             # Multi-input, change address & temporal heuristics
│   ├── risk/                   # Deterministic 0-100 risk scoring & evidence engine
│   └── ai/                     # NL query parser, tool dispatcher & report generator
├── tests/                      # Full unit & integration test suites
├── flake.nix                   # Nix development environment
└── docker-compose.yml          # Containerized deployment stack
```

---

## Verification & Definition of Done

- [x] Enter wallet address or transaction hash.
- [x] Retrieve and normalize blockchain data.
- [x] Construct directed weighted transaction graph.
- [x] Perform bounded multi-hop traversal and shortest path routing.
- [x] Detect suspicious patterns (Fan-out, Fan-in, Peel chain, Mixer, Bridge, Rapid transit).
- [x] Identify known entities and generate confidence-weighted attributions.
- [x] Cluster co-owned wallets using CIOH and change heuristics.
- [x] Calculate transparent 0–100 risk score with factor citations.
- [x] Natural language AI query parsing with tool execution transparency.
- [x] Export formatted judicial investigation report and subpoena checklist.
