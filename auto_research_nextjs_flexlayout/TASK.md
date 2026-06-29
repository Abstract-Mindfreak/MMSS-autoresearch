# MMSS Builder Migration: Flask → Next.js 16 + flexlayout-react

**Target**: Migrate the existing Flask application (https://github.com/kleafrog-source/mmss-builder/) into the Next.js 16 demo with flexlayout-react that has already been built.

**Source**: `mmss-builder/` (Flask app, Python, golden-layout v2)
**Destination**: `auto_research_nextjs_flexlayout/` (Next.js 16, TypeScript, flexlayout-react v0.9)

---

## CRITICAL RULES (NEVER VIOLATE)

1. **DO NOT remove any existing tabs or panels.** The current demo has 14 tabs. All must remain functional.
2. **DO NOT change the layout model structure** (`layout-model.ts`) tab order or naming without explicit instruction.
3. **All backend Python logic must be rewritten as TypeScript Next.js API routes** (under `src/app/api/`).
4. **Ollama communication must go through the Next.js API layer** — never call Ollama directly from client-side code.
5. **The `z-ai-web-dev-sdk` package is already installed** — use it for AI/LLM calls in API routes ONLY (never in `use client` components).
6. **Use relative paths only for API calls** — never hardcode `http://localhost:PORT`.
7. **Use shadcn/ui components** from `src/components/ui/` — do NOT install new UI libraries.
8. **Use Tailwind CSS 4** for all styling — no external CSS frameworks.
9. **Every panel uses `"use client"` directive.** API routes use `"use server"`.
10. **Run `bun run lint` after every major change** to ensure code quality.

---

## PROJECT STRUCTURE (Current State)

```
auto_research_nextjs_flexlayout/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Root page (dynamic import of flexlayout, ssr: false)
│   │   ├── layout.tsx                  # Root layout with metadata
│   │   ├── globals.css                # Tailwind + flexlayout dark theme overrides
│   │   └── api/
│   │       └── route.ts               # Currently a placeholder API route
│   ├── components/
│   │   ├── mmss/
│   │   │   ├── layout-model.ts        # flexlayout-react IJsonModel (14 tabs, 4 tabsets)
│   │   │   ├── mms-flex-layout.tsx    # Main FlexLayout component with factory pattern
│   │   │   └── panels/                # 14 panel components
│   │   │       ├── navigation-panel.tsx        # Sidebar navigation
│   │   │       ├── pfr-panel.tsx              # PFR - Fractal Reassembly
│   │   │       ├── frp-panel.tsx              # FRP - Temporal Navigator
│   │   │       ├── ammss-panel.tsx            # A-MMSS - Context Weaver
│   │   │       ├── orchestrator-panel.tsx     # Orchestrator pipeline
│   │   │       ├── game-panel.tsx             # MMSS Game
│   │   │       ├── ai-assistant-panel.tsx      # AI Chat interface
│   │   │       ├── prompt-generator-panel.tsx  # Prompt generation
│   │   │       ├── metrics-panel.tsx          # System metrics (live)
│   │   │       ├── console-panel.tsx          # Console log output
│   │   │       ├── auto-research-panel.tsx    # Auto Research Loop control
│   │   │       ├── mmss-models-panel.tsx      # MMSS Model pool management
│   │   │       ├── mmss-reports-panel.tsx     # Evaluation reports
│   │   │       └── mmss-compare-panel.tsx     # Side-by-side comparison
│   │   └── ui/                          # shadcn/ui components (already installed)
│   ├── lib/
│   │   ├── utils.ts
│   │   └── db.ts                     # Prisma client
│   └── hooks/
│       ├── use-toast.ts
│       └── use-mobile.ts
├── prisma/
│   └── schema.prisma                  # Database schema (SQLite)
├── package.json                       # Dependencies (flexlayout-react v0.9.2 already installed)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── bun.lock
```

---

## PHASE 1: BACKEND API INFRASTRUCTURE

### Step 1.1 — Create Prisma Database Schema

**File**: `prisma/schema.prisma`

Create models to mirror the Flask app's data storage. The Flask app uses:
- `config.json` for settings
- `TASKS.xml` for tasks
- `omega_core.json` for system definitions
- `python/configs/active.yaml` for active config
- `mmss_specs/*.json` for MMSS JSON specifications
- `llm/prompts/work/*.md` for prompt templates
- PostgreSQL via `AIPersistence` for chat history

**Schema to create**:

```prisma
// MMSS System Configuration
model SystemConfig {
  id        String   @id @default("main")
  theme     String   @default("dark")
  aiProvider String  @default("ollama")
  ollamaBaseUrl String @default("http://127.0.0.1:11434")
  ollamaModel    String @default("mmss-gemma4-q4:latest")
  ollamaTimeout  Int    @default(600)
  mistralModel   String @default("mistral-small-latest")
  customThemeCss String?
  updatedAt DateTime @updatedAt
}

// MMSS Task management (replaces TASKS.xml)
model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  status      String   @default("pending")  // pending, in_progress, completed, cancelled
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  comments    Comment[]
}

model Comment {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

// MMSS Model Specifications (replaces mmss_specs/*.json files)
model MMSSSpec {
  id          String   @id @default(uuid())
  systemId    String   @unique                  // e.g. "MMSS_META_SYNTHESIS_ULTIMATE_v1.0"
  title       String
  domain      String                           // e.g. "Physics", "Philosophy"
  purpose     String
  version     String   @default("v1.0")
  specJson    String                           // Full JSON content stored as text
  bestScore   Float    @default(0.0)
  lastEval    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  evaluations EvaluationReport[]
}

// Evaluation Reports (from LLM analysis)
model EvaluationReport {
  id              String   @id @default(uuid())
  systemId        String
  mmssSpecId      String?
  mmssSpec        MMSSSpec? @relation(fields: [mmssSpecId], references: [id])
  overall         Float
  coherence       Float
  coverage        Float
  reuse           Float
  falsifiability  Float
  verdict         String
  strengths       String                           // JSON array stored as text
  weaknesses      String                           // JSON array stored as text
  recommendations String                           // JSON array stored as text
  rawLlmComment   String?
  ollamaModelUsed String?
  createdAt       DateTime @default(now())
}

// Chat History (replaces PostgreSQL AIPersistence)
model ChatMessage {
  id        String   @id @default(uuid())
  role      String                           // "user", "assistant", "system"
  content   String
  model     String?
  provider  String   @default("ollama")
  createdAt DateTime @default(now())
}

// Auto Research Loop Log (replaces logs/auto_research_log.jsonl)
model ResearchLog {
  id                String   @id @default(uuid())
  round             Int
  systemId          String
  assetKind         String   // "config", "mmss_spec", "prompt"
  assetPath         String
  changeDescription String
  newScore          Float
  baselineScore     Float
  decision          String   // "kept", "reverted"
  ollamaModelUsed   String?
  operation         String   // "mmss_improve", "mmss_clone", "mmss_compare", "prompt_tune"
  createdAt         DateTime @default(now())
}
```

Run `bun run db:push` after creating the schema.

### Step 1.2 — Create API Route Structure

Create the following API routes under `src/app/api/`. Each route corresponds to a Flask route group.

| Flask Route | Next.js API Route | Purpose |
|---|---|---|
| `/api/activate` (POST) | `src/app/api/mmss/activate/route.ts` | Activate MMSS system |
| `/api/pfr` (POST) | `src/app/api/mmss/pfr/route.ts` | Run PFR reassembly |
| `/api/frp` (POST) | `src/app/api/mmss/frp/route.ts` | Run FRP navigation |
| `/api/ammss` (POST) | `src/app/api/mmss/ammss/route.ts` | Run A-MMSS context weave |
| `/api/prompt-generator` (POST) | `src/app/api/mmss/prompt/route.ts` | Generate prompts |
| `/api/ai/generate-and-send` (POST) | `src/app/api/ai/chat/route.ts` | AI chat (Ollama) |
| `/api/ai/generate-and-send-stream` (POST) | `src/app/api/ai/chat/stream/route.ts` | Streaming AI chat |
| `/ai` (POST) | `src/app/api/ai/generate/route.ts` | Generate AI response |
| `/settings/save` (POST) | `src/app/api/settings/route.ts` | Save/load config |
| `/api/settings/ollama/models` (GET) | `src/app/api/settings/ollama-models/route.ts` | List Ollama models |
| `/api/settings/provider` (POST) | `src/app/api/settings/provider/route.ts` | Switch AI provider |
| `/tasks/add` (POST) | `src/app/api/tasks/route.ts` | CRUD tasks |
| `/game/start` (POST) | `src/app/api/game/route.ts` | Game operations |
| `/orchestrate/send` (POST) | `src/app/api/orchestrator/route.ts` | Run orchestrator pipeline |
| — (new) | `src/app/api/mmss/evaluate/route.ts` | Evaluate MMSS spec |
| — (new) | `src/app/api/mmss/improve/route.ts` | Improve MMSS via LLM |
| — (new) | `src/app/api/mmss/compare/route.ts` | Compare two MMSS models |
| — (new) | `src/app/api/mmss/clone/route.ts` | Clone MMSS to new topic |
| — (new) | `src/app/api/research/loop/route.ts` | Auto research loop control |
| — (new) | `src/app/api/mmss/specs/route.ts` | CRUD MMSS specs |
| — (new) | `src/app/api/research/logs/route.ts` | Research log history |

### Step 1.3 — Create Ollama Client Utility

**File**: `src/lib/ollama.ts`

The Flask app uses `mmss_core/ai/ollama.py` (`LocalOllamaAPI`). Rewrite as a TypeScript utility:

```typescript
// Key functions to implement:
// - ping(baseUrl: string): Promise<boolean>
// - listModels(baseUrl: string): Promise<string[]>
// - generate(prompt: string, model: string, baseUrl: string, timeout: number): Promise<string>
// - generateStream(prompt: string, model: string, baseUrl: string): ReadableStream
```

The Flask `LocalOllamaAPI` class:
- Sends POST to `http://{base_url}/api/generate` with `{ model, prompt, stream: false, options: { temperature, num_predict } }`
- Sends GET to `http://{base_url}/api/tags` for `list_models()`
- Sends POST to `http://{base_url}/api/chat` for chat completions with `messages` array
- Default timeout: 600 seconds
- Supports streaming responses via `stream: true` (each line is `{"response":"...","done":false}` until `{"done":true}`)

---

## PHASE 2: REWRITE PYTHON CORE MODULES AS TYPESCRIPT

### Step 2.1 — PFR Engine (`mmss_core/fractal_reassembly.py` → `src/lib/mmss/pfr-engine.ts`)

Python class `FractalReassemblyEngine`:
- Loads package from `packages/fractal_reassembly_package.json` → **store in DB or static JSON**
- `activate(domain)` → returns activation status
- `calculate_eta_R(delta_V, delta_S, G_S, cost_complexity)` → `η_R = (ΔV / ΔS) * (G_S / Cost)`
- `calculate_V_applied(C_val, Phi_Domain, G_S, D_f, R_T)` → `V = 1 - (C_val * Phi_Domain) / (G_S * D_f * R_T)`
- `full_reassembly_cycle(problem_data)` → runs full cycle with all metrics

**TypeScript equivalent** — pure calculation functions, no external deps:
```typescript
export interface PFRMetrics {
  eta_R: number;       // Reassembly efficiency
  V: number;           // Applied value
  delta_S: number;     // Reorganized entropy
  cost_complexity: number;
  G_S: number;         // Semantic gravity
  D_f: number;         // Fractal dimension
  Phi_Domain: number;
}

export function calculateEtaR(deltaV: number, deltaS: number, G_S: number, cost: number): number
export function calculateV(C_val: number, Phi_Domain: number, G_S: number, D_f: number, R_T: number): number
export function fullReassemblyCycle(domain: string, params: Record<string, number>): PFRMetrics
```

### Step 2.2 — FRP Navigator (`mmss_core/temporal_navigator.py` → `src/lib/mmss/frp-navigator.ts`)

Python class `TemporalNavigator`:
- `activate()` → loads FRP package from JSON
- `navigate_scenario(scenario_data)` → processes recursive temporal scenario
- Tracks: chaos_level, plot_loss, scenario_signature, iteration_index, emotional_state

**TypeScript equivalent**:
```typescript
export interface FRPScenarioParams {
  chaos_level: number;
  plot_loss: boolean;
  scenario_signature: string;
  iteration_index: number;
  previous_iteration: number;
  emotional_state: "calm" | "moderate" | "strong" | "intense";
}

export interface FRPResult {
  status: string;
  chaos_reduced: number;
  coherence_restored: boolean;
  recursive_layers_resolved: number;
  summary: string;
}
```

### Step 2.3 — A-MMSS Context Weaver (`mmss_core/context_weaver.py` → `src/lib/mmss/context-weaver.ts`)

Python class `ContextWeaver`:
- 29 Phi-dimensions initialized to 1.0
- `activate()` → loads A-MMSS package, returns activation status
- Context parameters: R_T, S_1_mean, S_1_var, beta, Xi_topo_2, N_2, C_val_2, Phi_meta_self, lambda, Cost_eth_1_sum, etc.
- `calculate_G_S_2()` → `G_S^(2) = (1/R_T²) × ((S_1_mean + β×Var(S_1))) / (Ξ_topo^(2) ⊗ Φ_topology)`
- `calculate_optimization()` → `opt = (Φ_fractal_field² × Φ_universal_cohesion) × (1/Cost_eth²) × absolute_contextuality`

**TypeScript equivalent**: Pure calculation functions.

### Step 2.4 — Prompt Generator (`mmss_core/prompt_generator.py` → `src/lib/mmss/prompt-generator.ts`)

Python class `MMSSPromptGenerator`:
- Template-based prompt generation with placeholders: `{role_description}`, `{active_components}`, `{target_metrics}`, `{task_context}`, `{instructions}`, `{expected_result}`, `{ethical_constraints}`
- `generate_prompt(config)` → fills template from config dict

**TypeScript equivalent** — template string interpolation.

### Step 2.5 — Orchestrator (`mmss_core/orchestrator_core.py` → `src/lib/mmss/orchestrator.ts`)

Python class `MMSOrchestrator`:
- Loads agent config from JSON file
- 6 agents: Analyzer, PFR Engine, FRP Navigator, Context Weaver, Synthesizer, Validator
- Each agent has: name, operator, purpose, thinking_style, output_template
- `generate_prompt(agent, question)` → creates per-agent prompt
- `send_prompt_to_ollama(prompt)` → sends to Ollama

**TypeScript equivalent**:
- Agent definitions as a static array/config
- Per-agent prompt generation
- Sequential pipeline execution through API routes

### Step 2.6 — Auto Research Loop (`auto_research/auto_loop.py` → `src/lib/mmss/research-loop.ts`)

This is the **most complex module**. Python `auto_loop.py` (~500 lines):
- Reads `auto_research/instructions.md` for config (target_score, epsilon, stop_after_no_improve, max_rounds)
- Reads `omega_core.json` for system definitions
- Reads `python/configs/active.yaml` for numeric config
- Main loop: `_main_loop(config, ...)`:
  1. Choose asset: `["config", "mmss_spec", "prompt"][round % 3]`
  2. Mutate the asset:
     - `_mutate_config()` → randomly tweak sigma, delta_init, warmup_epochs, lr, etc.
     - `_mutate_mmss_spec()` → tweak unified_metrics values
     - `_mutate_prompt()` → append/modify prompt text
  3. Score the change: `score_config()` → runs validation pipeline → numeric score
  4. Compare: if `new_score > baseline + epsilon` → **keep**, else **revert**
  5. Log to `logs/auto_research_log.jsonl`
  6. Optional: call `_try_ollama_suggestion()` for LLM-guided mutations
  7. Check stop conditions: target_score, plateau (no_improve counter), stop.flag, max_rounds

**TypeScript equivalent** — this will be a Next.js API route that:
1. Accepts loop configuration via POST
2. Iterates through mutation rounds server-side
3. Stores results in Prisma `ResearchLog` table
4. Returns progress via SSE or polling
5. Supports MMSS-structural operations (improve, clone, compare, prompt_tune) via LLM calls

**Key difference from Flask**: In Flask the loop runs synchronously blocking the request. In Next.js, implement as **Server-Sent Events (SSE)** for real-time progress updates to the frontend.

### Step 2.7 — MMSS Evaluator (new — for MMSS scoring)

The Flask app's `score.py` uses `validate_metrics` from `python/validate_metrics.py` which runs actual ML validation (test_acc_clean, energy, latency, etc.). For the MMSS-structural mode, we need a **text-based evaluator** that:

1. Takes an MMSS JSON spec
2. Sends it to Ollama with an evaluation prompt
3. Parses LLM response to extract scores: coherence, coverage, reuse, falsifiability (0-1 each)
4. Computes `overall = weighted_average(coherence, coverage, reuse, falsifiability)`
5. Returns structured evaluation report

**Evaluation prompt template** (create in `src/lib/mmss/prompts/evaluate.ts`):
```
You are an MMSS system evaluator. Analyze the following MMSS JSON specification and score it on 4 dimensions (0.0-1.0):
1. coherence - internal consistency and logical structure
2. coverage - completeness of domain coverage
3. reuse - effective reuse of universal patterns/templates
4. falsifiability - presence of testable predictions

Return JSON: { "coherence": 0.0-1.0, "coverage": 0.0-1.0, "reuse": 0.0-1.0, "falsifiability": 0.0-1.0, "verdict": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...] }

MMSS Spec:
{mmss_json}
```

### Step 2.8 — MMSS Improver (new — for MMSS improvement)

```typescript
// src/lib/mmss/improver.ts
export async function improveMMSS(specJson: string, evaluation: EvaluationReport, model: string): Promise<string> {
  // 1. Build improvement prompt with spec + evaluation
  // 2. Send to Ollama
  // 3. Parse response as JSON (improved MMSS spec)
  // 4. Return improved JSON string
}
```

### Step 2.9 — MMSS Comparator (new — for side-by-side comparison)

```typescript
// src/lib/mmss/comparator.ts
export async function compareMMSS(specA: string, specB: string, model: string): Promise<{
  verdict: string;
  winner: string;
  analysis: string;
  metric_comparison: Record<string, { a: number; b: number; delta: number }>;
}> {
  // 1. Build comparison prompt with both specs
  // 2. Send to Ollama
  // 3. Parse structured comparison
}
```

---

## PHASE 3: CONNECT FRONTEND PANELS TO REAL API

### Step 3.1 — Update PFR Panel (`pfr-panel.tsx`)

**Current state**: Simulated data with `setTimeout`.

**Changes needed**:
- Replace `setTimeout` simulation with actual API call to `/api/mmss/pfr`
- User enters domain and parameters
- POST to API → backend runs PFR calculations → returns real `PFRMetrics`
- Display real results

```typescript
// Before (simulated):
const handleReassembly = () => {
  setIsComputing(true);
  setTimeout(() => { setResult({ eta_R: 0.87, ... }); }, 1500);
};

// After (real API):
const handleReassembly = async () => {
  setIsComputing(true);
  const res = await fetch('/api/mmss/pfr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, params: parameters }),
  });
  const data = await res.json();
  setResult(data);
  setIsComputing(false);
};
```

### Step 3.2 — Update FRP Panel (`frp-panel.tsx`)

Same pattern as PFR: replace simulation with `/api/mmss/frp` POST.

### Step 3.3 — Update A-MMSS Panel (`ammss-panel.tsx`)

Replace simulation with `/api/mmss/ammss` POST.

### Step 3.4 — Update Orchestrator Panel (`orchestrator-panel.tsx`)

Replace sequential `setTimeout` with real pipeline:
- POST to `/api/orchestrator` with question/domain
- Use SSE for real-time agent-by-agent progress
- Display actual LLM responses per agent

### Step 3.5 — Update AI Assistant Panel (`ai-assistant-panel.tsx`)

**Critical change**: Connect to real Ollama.
- Replace simulated responses with POST to `/api/ai/chat`
- Implement SSE streaming for real-time token display
- Store chat history in Prisma `ChatMessage` table
- Load history on panel mount

### Step 3.6 — Update Prompt Generator Panel (`prompt-generator-panel.tsx`)

Replace static template strings with API-generated prompts:
- POST to `/api/mmss/prompt` with { module, domain, config }
- Backend uses `MMSSPromptGenerator` logic to build real prompts
- Optionally call Ollama to customize prompts further

### Step 3.7 — Update Game Panel (`game-panel.tsx`)

Minimal change — the game is primarily frontend logic. Could add backend scoring if desired.

### Step 3.8 — Update Metrics Panel (`metrics-panel.tsx`)

Replace random simulation with real data:
- Poll `/api/mmss/status` endpoint every 3s
- Return actual system metrics from database (last PFR run, last FRP run, etc.)
- Keep the `setInterval` pattern but feed it real data

### Step 3.9 — Update Console Panel (`console-panel.tsx`)

Connect to real system events:
- Either SSE stream of server-side logs
- Or poll `/api/system/logs` for recent log entries
- Store logs in a database table or in-memory buffer on server

---

## PHASE 4: IMPLEMENT AUTO_RESEARCH / MMSS LOOP FUNCTIONALITY

### Step 4.1 — Update Auto Research Panel (`auto-research-panel.tsx`)

**Current state**: Simulated loop with hardcoded demo data.

**Target state**: Real loop connected to backend.

**Changes**:
1. Replace simulated loop with SSE connection to `/api/research/loop`
2. Configuration form sends to backend to start loop
3. Real-time round-by-round progress updates
4. Scores come from actual MMSS evaluation (Ollama) or numeric scoring
5. Store results in `ResearchLog` table

**Frontend flow**:
```
User clicks "Start Loop"
  → POST /api/research/loop { mode, operation, maxRounds, targetScore, epsilon, ollamaModel }
  → Backend starts loop, returns SSE stream
  → Frontend receives: { type: "round", data: { round, score, decision, change } }
  → Frontend receives: { type: "done", data: { totalRounds, bestScore, finalDecision } }
  → Frontend displays in real-time
```

### Step 4.2 — Update MMSS Models Panel (`mmss-models-panel.tsx`)

**Current state**: Hardcoded demo models with simulated improve/clone.

**Target state**: Real models from database with LLM-powered operations.

**Changes**:
1. Load models from `/api/mmss/specs` (Prisma `MMSSSpec` table)
2. "Improve" button → POST `/api/mmss/improve` → sends spec to Ollama → stores improved version
3. "Clone to New Topic" → POST `/api/mmss/clone` → LLM generates domain-adapted clone → stores
4. Score display from actual evaluation reports
5. "View JSON" button → shows full spec in a dialog/panel

### Step 4.3 — Update MMSS Reports Panel (`mmss-reports-panel.tsx`)

**Current state**: Hardcoded demo reports.

**Target state**: Real reports from database.

**Changes**:
1. Load reports from `/api/mmss/evaluate` history (Prisma `EvaluationReport` table)
2. Filter by system_id
3. Display real LLM verdicts, strengths, weaknesses
4. Show actual numeric scores

### Step 4.4 — Update MMSS Compare Panel (`mmss-compare-panel.tsx`)

**Current state**: Hardcoded demo comparison.

**Target state**: Real LLM-powered comparison.

**Changes**:
1. Model A and B selectors load from database
2. "Run Comparison" → POST `/api/mmss/compare` → sends both specs to Ollama → returns verdict
3. Display real metric deltas and LLM analysis
4. Store comparison results in database

---

## PHASE 5: DATA MIGRATION

### Step 5.1 — Migrate `omega_core.json`

This is the central system definition file containing all MMSS system metadata.

**Action**: Parse and import into `MMSSSpec` table.
```typescript
// src/lib/mmss/import-omega.ts
// Read omega_core.json → for each system in systems{} → create MMSSSpec record
```

### Step 5.2 — Migrate `mmss_specs/*.json`

All MMSS specification JSON files should be imported into the database.

### Step 5.3 — Migrate `TASKS.xml`

Parse XML tasks and import into `Task` + `Comment` tables.

### Step 5.4 — Migrate `config.json`

Import into `SystemConfig` table.

### Step 5.5 — Migrate `python/configs/active.yaml`

Parse YAML config into a structured JSON config for the research loop.

---

## PHASE 6: SETTINGS & CONFIGURATION

### Step 6.1 — Settings Page Integration

The Flask app has `/settings` with:
- Theme selection (light/dark/custom)
- AI provider switching (Ollama/Mistral)
- Ollama model selection
- Ollama base URL configuration
- Mistral model selection
- Custom CSS upload

**Implementation**: Add settings management to Navigation panel or create a settings dialog:
- Load config from `SystemConfig` table
- Save via `/api/settings` route
- Theme toggle already supported via `next-themes`

### Step 6.2 — Ollama Model Discovery

The Flask `/api/settings/ollama/models` endpoint:
1. Calls `GET http://{base_url}/api/tags` on Ollama
2. Returns list of available models
3. Merges with configured preferred models

**Implement** in `/api/settings/ollama-models/route.ts`.

---

## PHASE 7: TESTING & VERIFICATION

### Step 7.1 — Manual Test Checklist

For each panel, verify:
- [ ] PFR: Enter domain → click "Run Full Reassembly" → see real η_R, V, G_S values
- [ ] FRP: Set chaos level → click "Navigate Scenario" → see real navigation result
- [ ] A-MMSS: Click "Run Full Context Weaving" → see real G_S^(2), optimization values
- [ ] Orchestrator: Click "Run Auto Cycle" → see 6 agents process sequentially with real LLM responses
- [ ] AI Assistant: Type message → see real Ollama response streaming back
- [ ] Prompt Generator: Select module → click Generate → see real MMSS-formatted prompt
- [ ] Game: Start game → actions work (primarily frontend, minimal backend)
- [ ] Metrics: Values update from real system state, not random
- [ ] Console: Shows real server-side log events
- [ ] Auto Research: Start loop → see rounds progress → scores from real evaluation
- [ ] MMSS Models: Load from DB → Improve/Clone buttons call LLM → results saved to DB
- [ ] MMSS Reports: Show real evaluation reports with LLM analysis
- [ ] MMSS Compare: Select two models → compare → see real LLM verdict

### Step 7.2 — Run Lint

```bash
bun run lint
```

Fix all errors before considering the task complete.

### Step 7.3 — Verify No Regressions

Ensure all 14 tabs still render and function. No tabs should be removed, renamed, or broken.

---

## ARCHITECTURE DECISIONS

### Why flexlayout-react instead of golden-layout?
The demo already uses flexlayout-react v0.9.2 which is a React port of golden-layout. It provides:
- Better React integration (factory pattern, `useMemo` for model)
- TypeScript support
- Dark theme via CSS overrides
- `Model.fromJson()` for programmatic layout

The Flask app used golden-layout v2.6.0 (vanilla JS). Since we're migrating to Next.js (React), flexlayout-react is the correct choice.

### SSR/Hydration
flexlayout-react does NOT support SSR. The demo handles this with `next/dynamic` and `ssr: false` in `page.tsx`. **DO NOT CHANGE THIS** — removing it will cause hydration errors.

### State Management
- **Server state** (MMSS specs, evaluations, chat history): Prisma + TanStack Query
- **Client state** (UI toggles, selected items): React `useState` (already used in all panels)
- **Real-time updates** (research loop, chat streaming): Server-Sent Events (SSE)

### API Design
All API routes follow Next.js App Router conventions:
```
src/app/api/[group]/[action]/route.ts
```

Each route exports `GET` and/or `POST` handler functions.

---

## KEY FILE MAPPING (Flask → Next.js)

| Flask Python File | Next.js TypeScript File | Notes |
|---|---|---|
| `mmss_core/fractal_reassembly.py` | `src/lib/mmss/pfr-engine.ts` | Pure calculations |
| `mmss_core/temporal_navigator.py` | `src/lib/mmss/frp-navigator.ts` | Pure calculations |
| `mmss_core/context_weaver.py` | `src/lib/mmss/context-weaver.ts` | Pure calculations |
| `mmss_core/prompt_generator.py` | `src/lib/mmss/prompt-generator.ts` | Template logic |
| `mmss_core/orchestrator_core.py` | `src/lib/mmss/orchestrator.ts` | Agent pipeline + Ollama calls |
| `mmss_core/ai/ollama.py` | `src/lib/ollama.ts` | HTTP client for Ollama API |
| `mmss_activator.py` | `src/lib/mmss/activator.ts` | System activation |
| `auto_research/auto_loop.py` | `src/lib/mmss/research-loop.ts` | Loop engine |
| `python/score.py` | `src/lib/mmss/scoring.ts` | Numeric scoring |
| `omega_core.json` | Prisma `MMSSSpec` table | Data migration |
| `config.json` | Prisma `SystemConfig` table | Data migration |
| `TASKS.xml` | Prisma `Task` + `Comment` | Data migration |
| `templates/index.html` | Already replaced by flexlayout | N/A |
| `static/js/main.js` | Split into panel components | Already done |

---

## NOTES ON COMPLEXITY

1. **Auto Research Loop is the hardest part.** It runs a multi-round optimization loop that calls Ollama for MMSS evaluation and improvement. This must run server-side with SSE for progress. Budget significant time for this.

2. **MMSS JSON specs are large** (some >100KB). Store as `String` in Prisma, not as JSON type (SQLite doesn't support large JSON well).

3. **Ollama may be slow** (30-120 seconds per request). Design all UI with proper loading states and cancellable operations.

4. **The Flask app uses streaming** for AI chat (`generate-and-send-stream`). Implement equivalent SSE streaming in Next.js.

5. **Error handling is critical.** Ollama may be unavailable. Every API route must handle connection failures gracefully with helpful error messages.

---

## EXECUTION ORDER (Recommended)

1. **Phase 1.1**: Prisma schema → `bun run db:push`
2. **Phase 1.3**: Ollama client utility (`src/lib/ollama.ts`)
3. **Phase 2.1-2.4**: Core calculation modules (PFR, FRP, A-MMSS, Prompt) — pure TypeScript, testable in isolation
4. **Phase 1.2 + 2.5**: API routes + Orchestrator
5. **Phase 3.1-3.6**: Connect panels to real APIs (start with PFR, then FRP, A-MMSS, AI Assistant, Prompt Generator)
6. **Phase 2.6-2.9**: Research loop + Evaluator + Improver + Comparator
7. **Phase 4.1-4.4**: Connect auto-research/MMSS panels to real loop
8. **Phase 5**: Data migration scripts
9. **Phase 6**: Settings integration
10. **Phase 7**: Testing + lint
