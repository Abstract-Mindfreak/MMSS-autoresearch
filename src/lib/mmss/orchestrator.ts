export interface MMSSAgentDefinition {
  id: string
  name: string
  operator: string
  purpose: string
  thinkingStyle: string
  outputTemplate: string
  bestFor: string
}

export const ORCHESTRATOR_AGENTS: MMSSAgentDefinition[] = [
  {
    id: "quantum_map",
    name: "QUANTUM_MAP",
    operator: "↦ₚ",
    purpose: "Complex transformation and state collapse over multiple candidate solutions.",
    thinkingStyle: "probabilistic, multivariant, collapse-to-solution",
    outputTemplate: "markdown",
    bestFor: "ambiguous tasks with several competing solution paths",
  },
  {
    id: "meta_derivation",
    name: "META_DERIVATION",
    operator: "⊢ᵐ",
    purpose: "Logical proof building and necessity derivation.",
    thinkingStyle: "deductive, strict, chain-of-inference",
    outputTemplate: "markdown",
    bestFor: "proofs, rules, formal dependencies",
  },
  {
    id: "fractal_entailment",
    name: "FRACTAL_ENTAILMENT",
    operator: "⇛ᶠ",
    purpose: "Pattern recognition across scales and invariant extraction.",
    thinkingStyle: "recursive, scale-aware, self-similar",
    outputTemplate: "markdown",
    bestFor: "multi-scale systems and structural recurrence",
  },
  {
    id: "temporal_generation",
    name: "TEMPORAL_GENERATION",
    operator: "⧴ᵗ",
    purpose: "Temporal trajectory generation and dynamic scenario planning.",
    thinkingStyle: "evolutionary, dynamic, path-dependent",
    outputTemplate: "markdown",
    bestFor: "roadmaps, forecasts, staged execution",
  },
  {
    id: "golden_derivation",
    name: "GOLDEN_DERIVATION",
    operator: "⊢ᵍ",
    purpose: "Harmony and optimal proportion search.",
    thinkingStyle: "harmonic, proportional, phi-oriented",
    outputTemplate: "markdown",
    bestFor: "creative balance, architecture, elegant tradeoffs",
  },
  {
    id: "correction_enhanced",
    name: "CORRECTION_ENHANCED",
    operator: "↦ᶜ",
    purpose: "Robust correction and noise-resistant reframing.",
    thinkingStyle: "self-correcting, resilient, fault-tolerant",
    outputTemplate: "markdown",
    bestFor: "uncertain inputs, noisy specs, brittle reasoning",
  },
  {
    id: "summary_writer",
    name: "MULTYFUNCTIONAL_SUMMARY_WRITER_OBSIDIAN",
    operator: "Σₒ",
    purpose: "Structured archival summary for Obsidian-style knowledge objects.",
    thinkingStyle: "structural, meta-documenting, archival",
    outputTemplate: "markdown",
    bestFor: "system cards, summaries, documentation artifacts",
  },
  {
    id: "nodeflow_exporter",
    name: "OBSIDIAN_NODEFLOW_EXPORTER",
    operator: "⇢ₙ",
    purpose: "Nodeflow-friendly schema export for connected knowledge graphs.",
    thinkingStyle: "schematic, graph-oriented, componentized",
    outputTemplate: "nodeflow-list",
    bestFor: "graph export, visualization-ready structures",
  },
  {
    id: "ultra_concise",
    name: "ULTRA_CONCISE_LINKED_SUMMARY",
    operator: "μₛ",
    purpose: "Ultra-dense linked summary for fast recall.",
    thinkingStyle: "compressed, semantic-dense, hyperlink-first",
    outputTemplate: "markdown",
    bestFor: "daily notes, index entries, quick context handoff",
  },
  {
    id: "omni_synthesizer",
    name: "OMNIAGENT_UNIFIED_SYNTHESIZER",
    operator: "Ω",
    purpose: "Unified synthesis across all prior agent outputs.",
    thinkingStyle: "integrative, layered, unifying",
    outputTemplate: "markdown",
    bestFor: "final merged answer from all agent perspectives",
  },
]

export function generateAgentPrompt(agent: MMSSAgentDefinition, question: string, context?: string) {
  return [
    `MMSS AGENT: ${agent.name}`,
    `Operator: ${agent.operator}`,
    `Purpose: ${agent.purpose}`,
    `Thinking style: ${agent.thinkingStyle}`,
    `Best for: ${agent.bestFor}`,
    `Output template: ${agent.outputTemplate}`,
    "",
    "Follow the MMSS orchestration principle:",
    "1. Preserve useful structure from the request.",
    "2. Apply the agent-specific transformation only.",
    "3. Return substantive output even if the source is partial or truncated.",
    "4. Do not refuse just because the input is imperfectly formatted.",
    "5. If reasoning appears in the model output, preserve it in the final answer.",
    "",
    context ? `Prior agent context:\n${context}` : "",
    `User question:\n${question}`,
    "",
    "Return a practical MMSS-aligned result.",
  ]
    .filter(Boolean)
    .join("\n")
}
