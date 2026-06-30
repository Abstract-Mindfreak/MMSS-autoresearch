export interface PromptConfig {
  prompt_type?: "full" | "pfr" | "frp" | "ammss"
  role_description?: string
  task_context?: string
  instructions?: string
  expected_result?: string
  ethical_constraints?: string
  domain?: string
  export_format?: "text" | "markdown" | "json"
  enable_pfr?: boolean
  enable_frp?: boolean
  enable_ammss?: boolean
  target_eta_r?: boolean
  target_value?: boolean
  target_coherence?: boolean
  target_cohesion?: boolean
  module?: string
}

function getDefaultRoleDescription() {
  return [
    "You are an MMSS agent specialized in:",
    "- fractal reassembly of information",
    "- temporal navigation across recursive scenarios",
    "- context weaving with ethical stabilization",
    "Your goal is to maximize reassembly efficiency and practical value.",
  ].join("\n")
}

function getDefaultInstructions() {
  return [
    "1. Analyze the task through fractal structure.",
    "2. Apply recursive temporal navigation when relevant.",
    "3. Weave context with ethical stabilization.",
    "4. Maximize eta_R.",
    "5. Push practical value toward 1.0.",
    "6. Keep operator coherence above 0.95.",
  ].join("\n")
}

function getDefaultEthics() {
  return [
    "- Check ethical cost before optimization.",
    "- Preserve universal cohesion.",
    "- Prefer stable, grounded, and useful outcomes.",
  ].join("\n")
}

function generateComponentsDescription(config: PromptConfig) {
  const parts: string[] = []
  if (config.enable_pfr ?? true) {
    parts.push("PFR: transforms entropy into order via fractal disintegration, domain mapping, and coherent assembly.")
  }
  if (config.enable_frp ?? true) {
    parts.push("FRP: navigates recursive temporal loops through recursive self, chaos catalyst, loop navigator, and temporal bridge.")
  }
  if (config.enable_ammss ?? true) {
    parts.push("A-MMSS: weaves fractal, semantic, ethical, and resonance operators into a context field of second order.")
  }
  return parts.join("\n")
}

function generateMetricsDescription(config: PromptConfig) {
  const metrics: string[] = []
  if (config.target_eta_r ?? true) metrics.push("- eta_R -> infinity")
  if (config.target_value ?? true) metrics.push("- V -> 1.0")
  if (config.target_coherence ?? true) metrics.push("- Psi_ops > 0.95")
  if (config.target_cohesion ?? true) metrics.push("- Phi_universal_cohesion -> 1.0")
  if (config.domain) metrics.push(`- Domain: ${config.domain}`)
  return metrics.join("\n")
}

function generateFullPrompt(config: PromptConfig) {
  return [
    "# MMSS System",
    "",
    "Role:",
    config.role_description ?? getDefaultRoleDescription(),
    "",
    "Active Components:",
    generateComponentsDescription(config),
    "",
    "Target Metrics:",
    generateMetricsDescription(config),
    "",
    "Task Context:",
    config.task_context ?? "Not specified",
    "",
    "Instructions:",
    config.instructions ?? getDefaultInstructions(),
    "",
    "Expected Result:",
    config.expected_result ?? "Optimal solution with maximum practical value.",
    "",
    "Ethical Constraints:",
    config.ethical_constraints ?? getDefaultEthics(),
  ].join("\n")
}

function generatePfrPrompt(config: PromptConfig) {
  return [
    "# MMSS PFR",
    "Apply a three-stage practical fractal reassembly cycle.",
    "Stage 1: identify entropic and weak structural fragments.",
    "Stage 2: map fragments into the target domain and select optimal D_f.",
    "Stage 3: reassemble toward V = 1.0 with eta_R maximization.",
    `Domain: ${config.domain ?? "general"}`,
    `Task Context: ${config.task_context ?? "Not specified"}`,
  ].join("\n")
}

function generateFrpPrompt(config: PromptConfig) {
  return [
    "# MMSS FRP",
    "Activate recursive temporal navigation.",
    "Use Omega_RECURSIVE_SELF, Omega_CHAOS_CATALYST, Omega_LOOP_NAVIGATOR, Omega_TEMPORAL_BRIDGE.",
    "Preserve recursive memory access and temporal bridge strength when possible.",
    `Task Context: ${config.task_context ?? "Not specified"}`,
  ].join("\n")
}

function generateAmmssPrompt(config: PromptConfig) {
  return [
    "# MMSS A-MMSS",
    "Apply W_context^(2) = cut_fractal x sew_semantic + embed_ethical x loop_resonance.",
    "Target second-order value, ethical stabilization, and universal cohesion.",
    `Task Context: ${config.task_context ?? "Not specified"}`,
  ].join("\n")
}

export function generatePrompt(config: PromptConfig): string {
  const promptType = config.prompt_type ?? (config.module as PromptConfig["prompt_type"]) ?? "full"

  const prompt =
    promptType === "pfr"
      ? generatePfrPrompt(config)
      : promptType === "frp"
        ? generateFrpPrompt(config)
        : promptType === "ammss"
          ? generateAmmssPrompt(config)
          : generateFullPrompt(config)

  if (config.export_format === "markdown") {
    return `\`\`\`markdown\n${prompt}\n\`\`\``
  }

  if (config.export_format === "json") {
    return JSON.stringify(
      {
        prompt,
        version: "1.0",
        system: "MMSS",
        prompt_type: promptType,
      },
      null,
      2
    )
  }

  return prompt
}
