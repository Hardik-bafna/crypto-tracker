
# AI Agent Skills: Cryptocurrency Transaction Tracing System

## 1. Project Objective

Build a software platform for authorized drug-law-enforcement investigators to trace cryptocurrency fund flows from a known wallet address or transaction hash.

The platform must:

1. Accept a wallet address or transaction hash.
2. Retrieve blockchain transaction data.
3. Construct a transaction graph.
4. Trace funds across multiple hops.
5. Detect suspicious transaction patterns.
6. Identify known services such as exchanges, mixers, bridges, and other labeled entities.
7. Cluster potentially related wallets.
8. Calculate a risk score with explainable evidence.
9. Support cross-chain tracing where technically possible.
10. Present the investigation through an interactive graph UI.
11. Generate an evidence-based investigation report.

The system must **not claim to identify a real person solely from a blockchain address**. It should provide attribution hypotheses, evidence, confidence, and known-entity associations.

---

# 2. Core Engineering Principles

The agent must follow these principles:

### Correctness over complexity

Prefer a smaller system that produces correct, explainable results over a large system containing speculative AI-generated conclusions.

### Deterministic analysis

Blockchain traversal, graph algorithms, transaction calculations, and risk scoring must be deterministic.

Do not use an LLM to:

* invent transactions
* infer nonexistent wallet relationships
* fabricate entity identities
* decide whether a transaction occurred
* replace graph algorithms
* produce unsupported attribution

### Explainability

Every suspicious finding must have supporting evidence.

Bad:

```text
Wallet is probably criminal.
```

Good:

```text
Risk Score: 82/100

Evidence:
- Interaction with known mixer
- 7-hop transaction path to known exchange cluster
- Rapid movement across 5 wallets
- Wallet belongs to a high-confidence cluster
```

### Modular architecture

Separate:

```text
Blockchain ingestion
Transaction normalization
Graph construction
Graph analysis
Entity intelligence
Risk scoring
Investigation API
AI layer
Frontend
```

Do not create a monolithic application.

---

# 3. Technology Stack

Use the following stack unless a technical limitation requires otherwise.

## Frontend

```text
Next.js
TypeScript
React
Tailwind CSS
React Flow
```

## Backend

```text
Node.js
TypeScript
Fastify
Zod
```

## Databases

```text
PostgreSQL
Neo4j
Redis
```

## Background Processing

```text
BullMQ
Redis
```

## Infrastructure

```text
Docker
Docker Compose
```

## Testing

```text
Vitest
Playwright
```

---

# 4. Repository Structure

Use a clean structure similar to:

```text
crypto-tracer/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── workers/
│       │   ├── middleware/
│       │   └── lib/
│       │
│       └── tests/
│
├── packages/
│   ├── blockchain/
│   ├── graph/
│   ├── analysis/
│   ├── entities/
│   ├── risk/
│   ├── database/
│   ├── types/
│   └── config/
│
├── prisma/
│
├── docker/
│
├── scripts/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
└── README.md
```

The exact directory structure may be adjusted if the existing repository already has a consistent architecture.

---

# 5. Blockchain Support

Build the system so blockchain integrations are modular.

The initial implementation should prioritize:

```text
Bitcoin
Ethereum
ERC-20 tokens
USDT on Ethereum
```

Additional chains can be added later.

Use an interface such as:

```text
BlockchainAdapter

getTransaction()
getAddressTransactions()
getBalance()
getTransfers()
getBlock()
getTransactionStatus()
```

Every blockchain implementation must conform to the same abstraction.

Example conceptual interface:

```typescript
interface BlockchainAdapter {
  chain: string;

  getTransaction(txHash: string): Promise<Transaction>;

  getAddressTransactions(
    address: string,
    options?: PaginationOptions
  ): Promise<Transaction[]>;

  getTokenTransfers(
    address: string,
    options?: PaginationOptions
  ): Promise<TokenTransfer[]>;

  validateAddress(address: string): boolean;
}
```

---

# 6. Blockchain Data Ingestion

Never perform large blockchain synchronization inside an HTTP request.

Use background jobs.

Architecture:

```text
API
 │
 ▼
Create Investigation
 │
 ▼
Queue Job
 │
 ▼
Worker
 │
 ▼
Blockchain Provider
 │
 ▼
Normalize Data
 │
 ▼
PostgreSQL
 │
 ▼
Graph Builder
```

Workers must support:

* retries
* exponential backoff
* idempotency
* rate limiting
* pagination
* partial failures
* provider failures
* logging

Do not duplicate transactions when a job is retried.

---

# 7. Data Normalization

Different blockchains expose different transaction models.

Normalize them into a common internal representation.

Example:

```typescript
interface NormalizedTransaction {
  id: string;
  chain: string;
  txHash: string;
  blockNumber?: number;
  timestamp: Date;

  from: string[];
  to: string[];

  asset: string;
  amount: string;

  fee?: string;

  status: "confirmed" | "pending" | "failed";

  metadata?: Record<string, unknown>;
}
```

For Bitcoin, preserve UTXO information.

For Ethereum, preserve:

* transaction
* internal transaction where available
* token transfers
* contract address
* event information

Never destroy chain-specific information during normalization.

---

# 8. Database Model

PostgreSQL should store normalized blockchain data.

Minimum entities:

```text
Investigation
Address
Transaction
Transfer
Entity
EntityAddress
WalletCluster
RiskAssessment
Evidence
InvestigationEvent
```

Important indexes:

```text
Transaction.txHash
Transaction.chain
Address.address
Address.chain
Transfer.fromAddress
Transfer.toAddress
Transfer.timestamp
EntityAddress.address
```

Use database constraints to prevent duplicate transactions.

---

# 9. Graph Model

Represent cryptocurrency flows as a directed weighted graph.

```text
Node = wallet/address/entity

Edge = transfer
```

Example:

```text
Wallet A
   │
   │ 2.4 BTC
   ▼
Wallet B
   │
   │ 2.1 BTC
   ▼
Wallet C
```

Each edge should contain:

```text
transaction hash
asset
amount
timestamp
chain
source
destination
```

The graph must support:

* forward traversal
* backward traversal
* N-hop traversal
* shortest paths
* path enumeration
* filtering by asset
* filtering by amount
* filtering by time
* filtering by chain
* filtering by entity type

---

# 10. Graph Algorithms

Implement deterministic graph algorithms.

Required:

```text
BFS
DFS
Dijkstra
Connected Components
Shortest Path
N-hop traversal
```

Additional algorithms can be added later:

```text
Strongly Connected Components
Centrality
Community Detection
K-shortest paths
Temporal graph traversal
```

Do not use A* unless a meaningful admissible heuristic exists. Standard BFS/Dijkstra is sufficient for most transaction tracing operations.

---

# 11. Fund Tracing

Given:

```text
source wallet
```

the system must be able to trace:

```text
source
 ↓
transaction
 ↓
wallet
 ↓
transaction
 ↓
wallet
```

Example API:

```text
POST /investigations
```

Input:

```json
{
  "chain": "ethereum",
  "target": "0x...",
  "direction": "forward",
  "maxHops": 10
}
```

The result should contain:

```text
nodes
edges
paths
entities
evidence
risk
```

---

# 12. Transaction Flow Rules

Do not treat every transaction as simple:

```text
A → B
```

Bitcoin may contain multiple inputs and outputs.

Ethereum may contain:

```text
EOA → contract
contract → wallet
wallet → token contract
```

The system must distinguish:

```text
native asset transfer
token transfer
contract interaction
fee payment
```

Do not incorrectly interpret smart-contract interactions as direct money transfers.

---

# 13. Suspicious Pattern Detection

Implement a rule engine.

Each rule should return:

```typescript
{
  ruleId: string;
  severity: number;
  confidence: number;
  evidence: Evidence[];
}
```

Initial rules:

## Fan-out

One wallet sends funds to many wallets in a short period.

## Fan-in

Many wallets send funds into one wallet.

## Rapid movement

Funds move through multiple addresses within a short period.

## Peel chain

A wallet repeatedly forwards most of the received funds while retaining a smaller amount.

## High-hop movement

Funds pass through an unusually large number of intermediary addresses.

## Known service interaction

Wallet interacts with a known mixer, exchange, bridge, gambling service, or other labeled entity.

## Cross-chain movement

Funds are moved through a known bridge or cross-chain mechanism.

Rules must be configurable.

---

# 14. Entity Intelligence

Create an entity intelligence system.

Example:

```text
Entity:
Example Exchange

Type:
EXCHANGE

Addresses:
0xABC...
0xDEF...

Confidence:
HIGH

Source:
Verified intelligence dataset
```

Supported entity types:

```text
EXCHANGE
MIXER
BRIDGE
MARKETPLACE
GAMBLING
SCAM
KNOWN_ILLICIT
SERVICE
UNKNOWN
```

Never hardcode unsupported claims about real-world entities.

Entity information must have:

```text
source
confidence
lastVerified
```

---

# 15. Wallet Clustering

Implement wallet clustering as a separate analysis module.

The system may use signals such as:

```text
common-input behavior
change-address patterns
address reuse
transaction timing
repeated interaction
fund-flow similarity
```

Each cluster must have:

```text
clusterId
members
confidence
signals
```

Example:

```text
Cluster #42

Members:
A
B
C
D

Confidence:
0.81

Signals:
- Common transaction behavior
- Shared input patterns
- Similar timing
```

Never describe a cluster as a confirmed individual.

---

# 16. Risk Engine

Create a transparent scoring system.

Example:

```text
Mixer interaction        +25
Known illicit entity     +30
Rapid fund movement      +10
Suspicious clustering    +15
Cross-chain movement     +10
High-hop flow            +10
```

Normalize the score to:

```text
0 - 100
```

Risk levels:

```text
0-24    LOW
25-49   MEDIUM
50-74   HIGH
75-100  CRITICAL
```

The exact weights must be configurable.

Every score must contain reasons.

---

# 17. Evidence System

Every analytical conclusion must create evidence.

Example:

```typescript
interface Evidence {
  id: string;
  type: string;
  description: string;
  confidence: number;
  source?: string;
  transactionIds?: string[];
  addressIds?: string[];
}
```

Example output:

```text
Finding:

Funds interacted with a known mixer.

Confidence:
0.94

Evidence:
Transaction TX123
Wallet 0xABC
Known mixer address 0xDEF
```

The frontend must allow investigators to inspect the evidence behind a finding.

---

# 18. Attribution

The system must distinguish:

```text
Observed fact
Inference
Attribution
```

Example:

```text
OBSERVED:
Wallet A transferred 5 ETH to Wallet B.

OBSERVED:
Wallet B interacted with Exchange X.

INFERENCE:
Wallet B may be associated with Exchange X.

ATTRIBUTION:
Exchange X

CONFIDENCE:
0.83
```

Never convert an inference into a fact.

Never fabricate a person's identity.

---

# 19. Cross-Chain Architecture

Cross-chain support must be implemented as adapters.

Conceptual:

```text
Bitcoin
   │
   ▼
BTC Adapter
   │
   ▼
Normalized Graph
   │
   ▼
Bridge Detection
   │
   ▼
Ethereum Adapter
   │
   ▼
Ethereum Graph
```

Represent cross-chain relationships explicitly:

```text
CrossChainTransfer
```

with:

```text
sourceChain
sourceTransaction
destinationChain
destinationTransaction
bridge
confidence
```

Do not assume two transactions belong to the same transfer without evidence.

---

# 20. Monero and Privacy Chains

Do not claim that the system can fully trace Monero.

When a privacy-preserving chain prevents reliable tracing, return:

```text
traceability: LIMITED
reason: PRIVACY_MECHANISM
```

The system must communicate uncertainty rather than inventing paths.

---

# 21. AI Agent Layer

Use an LLM only as an orchestration and explanation layer.

Architecture:

```text
User
 │
 ▼
LLM
 │
 ├── parse investigation request
 │
 ├── select analysis tools
 │
 ├── construct query
 │
 └── summarize results
          │
          ▼
     Analysis Engine
```

Available tools should include:

```text
get_wallet()
get_transaction()
get_transactions()
trace_funds()
find_path()
find_entity()
get_cluster()
detect_patterns()
calculate_risk()
get_evidence()
generate_report()
```

The LLM must call tools rather than inventing blockchain data.

---

# 22. Natural Language Investigation

Support queries such as:

```text
"Trace this wallet forward 10 hops."

"Where did these funds eventually end up?"

"Show all wallets connected to this transaction."

"Find interactions with mixers."

"Find the first known exchange reached by these funds."

"Show suspicious fund flows above 1 BTC."

"Explain why this wallet has a high risk score."
```

Convert natural language into structured tool calls.

---

# 23. AI Guardrails

The AI must:

1. Never fabricate transactions.
2. Never fabricate wallet addresses.
3. Never fabricate entity relationships.
4. Never claim a person owns a wallet without authoritative evidence.
5. Never modify blockchain data.
6. Never hide uncertainty.
7. Always cite internal evidence IDs when making analytical claims.
8. Clearly distinguish facts from inferences.
9. Never invent intelligence sources.
10. Never treat the model's own reasoning as evidence.

If data is unavailable:

```text
Insufficient evidence to determine this.
```

---

# 24. Investigation API

Minimum endpoints:

```text
POST   /investigations
GET    /investigations/:id

POST   /investigations/:id/trace

GET    /investigations/:id/graph

GET    /investigations/:id/evidence

GET    /investigations/:id/risk

GET    /addresses/:address

GET    /transactions/:hash

GET    /entities/:id

GET    /clusters/:id
```

Use Zod for request validation.

---

# 25. Frontend

The primary screen should be an investigation workspace.

Required components:

```text
InvestigationHeader
SearchInput
GraphCanvas
TransactionDetails
WalletDetails
EntityDetails
RiskScore
EvidencePanel
Timeline
Filters
InvestigationSidebar
```

The graph must support:

```text
zoom
pan
node selection
edge selection
expand node
collapse node
filter
highlight path
highlight suspicious nodes
```

Do not overcrowd the initial screen.

---

# 26. Investigation Workflow

The intended user workflow:

```text
1. Investigator enters wallet or transaction hash.

2. System validates the input.

3. System identifies blockchain.

4. System retrieves relevant transactions.

5. System normalizes blockchain data.

6. System builds graph.

7. Investigator chooses:
   - forward tracing
   - backward tracing
   - max hops
   - asset
   - time range

8. Analysis engine traverses graph.

9. Pattern engine detects suspicious behavior.

10. Entity engine checks known addresses.

11. Cluster engine identifies related wallets.

12. Risk engine calculates risk.

13. Evidence engine records findings.

14. Frontend visualizes results.

15. AI generates an investigation summary.
```

---

# 27. Performance

The system must not load unlimited transaction history into memory.

Use:

```text
pagination
streaming
caching
database indexes
background jobs
bounded graph traversal
```

Tracing must have limits:

```text
maxHops
maxNodes
maxTransactions
timeRange
minimumTransferValue
```

Prevent graph explosion.

---

# 28. Caching

Use Redis for:

```text
frequently requested addresses
transaction lookups
entity lookups
investigation jobs
temporary graph results
```

Blockchain provider responses should be cached where appropriate.

---

# 29. Security

Implement:

```text
authentication
authorization
RBAC
input validation
rate limiting
audit logging
secure environment variables
```

Never expose:

```text
API keys
private keys
RPC credentials
database passwords
LLM API keys
```

Never store cryptocurrency private keys.

This system is for **analysis of known blockchain data**, not wallet control.

---

# 30. Testing

Every core module requires unit tests.

Minimum:

```text
Blockchain adapters
Transaction normalization
Graph construction
BFS/DFS traversal
Path finding
Pattern detection
Wallet clustering
Risk scoring
Entity matching
Evidence generation
API validation
```

Add integration tests for:

```text
Blockchain → database
Database → graph
Graph → analysis
Analysis → API
API → frontend
```

Use deterministic fixture blockchain data for tests.

Do not make tests depend on live blockchain APIs.

---

# 31. Demo Dataset

Create a synthetic dataset for development.

Example:

```text
Drug-associated wallet
        ↓
Wallet A
        ↓
Wallet B
      /   \
     /     \
Wallet C  Wallet D
     \     /
      \   /
       Mixer
         ↓
       Wallet E
         ↓
       Bridge
         ↓
       Wallet F
         ↓
     Exchange
```

This dataset must be explicitly labeled as synthetic.

Use it for:

* graph visualization
* tracing
* clustering
* risk scoring
* mixer detection
* bridge detection
* report generation

---

# 32. Development Strategy

Build in this order:

## Phase 1

```text
Repository
Docker
PostgreSQL
Backend
Frontend
```

## Phase 2

```text
Blockchain adapters
Transaction ingestion
Database schema
```

## Phase 3

```text
Graph construction
Graph traversal
Visualization
```

## Phase 4

```text
Pattern detection
Entity intelligence
Risk scoring
Evidence
```

## Phase 5

```text
Wallet clustering
Cross-chain relationships
```

## Phase 6

```text
AI investigation agent
Natural-language queries
Report generation
```

## Phase 7

```text
Testing
Performance
Security
Deployment
```

Do not begin with the AI agent.

The AI agent is useless if the underlying transaction graph is garbage.

---

# 33. Definition of Done

The project is considered functional when an investigator can:

```text
✓ Enter a transaction hash.

✓ Retrieve blockchain data.

✓ View the transaction.

✓ Expand connected wallets.

✓ Trace funds multiple hops.

✓ Visualize the complete path.

✓ Detect suspicious patterns.

✓ Identify known services.

✓ View wallet clusters.

✓ View risk score.

✓ Inspect supporting evidence.

✓ Filter transactions.

✓ View a transaction timeline.

✓ Ask natural-language investigation questions.

✓ Receive an evidence-backed explanation.

✓ Export an investigation report.
```

---

# 34. Code Quality Rules

The AI agent must:

* Use TypeScript strictly.
* Avoid `any` unless unavoidable.
* Validate external data.
* Keep functions small.
* Separate business logic from HTTP handlers.
* Avoid duplicated logic.
* Use clear names.
* Add error handling around external APIs.
* Log meaningful failures.
* Never silently swallow errors.
* Never hardcode secrets.
* Never hardcode production API responses.
* Write tests for non-trivial algorithms.
* Keep blockchain adapters replaceable.
* Keep analysis algorithms independent from the UI.

---

# 35. AI Agent Behavior

When implementing a feature:

```text
1. Inspect the existing repository.

2. Understand the current architecture.

3. Do not rewrite unrelated code.

4. Identify the smallest set of files required.

5. Implement the feature.

6. Add/update types.

7. Add tests.

8. Run lint/typecheck/tests.

9. Fix errors.

10. Update documentation when architecture changes.
```

Never blindly generate an entire project from scratch if an existing implementation already exists.

---

# 36. Priority

When making engineering decisions, prioritize:

```text
1. Correctness
2. Evidence integrity
3. Security
4. Explainability
5. Reliability
6. Performance
7. Maintainability
8. UI polish
```

Do not sacrifice correctness to make a demo look impressive.

---

# 37. Final Product

The final system should feel like an investigation platform rather than a blockchain explorer.

The core experience should be:

```text
                 TRANSACTION
                      │
                      ▼
                FUND FLOW GRAPH
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       PATTERNS     ENTITIES    CLUSTERS
          │           │           │
          └───────────┼───────────┘
                      ▼
                  RISK SCORE
                      │
                      ▼
                   EVIDENCE
                      │
                      ▼
             INVESTIGATION REPORT
```

The central engineering principle is:

> **Trace what can be observed, infer only what can be supported, and clearly communicate what cannot be determined.**
