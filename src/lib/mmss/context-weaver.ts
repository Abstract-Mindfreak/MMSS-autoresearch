export interface ContextWeaverParams {
  R_T: number
  S_1_mean: number
  S_1_var: number
  beta: number
  Xi_topo_2: number
  N_2: number
  C_val_2: number
  Phi_meta_self: number
  lambda: number
  Cost_eth_1_sum: number
  Phi_fractal_field: number
  Psi_co_2: number
  resonance: number
  Phi_universal_cohesion: number
  absolute_contextuality: number
  S_2: number
}

export interface ContextWeaverResult {
  status: string
  completion_condition_met: boolean
  W_context_2: number
  opt_A_MMSS: number
  metrics: {
    G_S_2: number
    V_2: number
    Cost_eth_2: number
    Phi_universal_cohesion: number
    absolute_contextuality: number
  }
  verification: {
    method: string
    success_criteria: string
    final_state: string
  }
}

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(denominator) || denominator === 0) {
    return 0
  }
  return numerator / denominator
}

function calculateGS2(params: ContextWeaverParams) {
  const numerator = params.S_1_mean + params.beta * params.S_1_var
  const denominator = params.Xi_topo_2 * Math.max(0.001, 1 - params.N_2) ** 2
  return Number((safeDivide(1, params.R_T ** 2) * safeDivide(numerator, denominator)).toFixed(6))
}

function calculateV2(params: ContextWeaverParams, gS2: number) {
  const value = 1 - safeDivide(params.C_val_2, gS2 * Math.max(0.001, params.R_T))
  return Number(Math.max(0, Math.min(1, value)).toFixed(6))
}

function calculateCostEth2(params: ContextWeaverParams, gS2: number) {
  const term1 = safeDivide(params.Phi_meta_self ** 2, Math.max(gS2, 0.0001)) * (params.C_val_2 ** 2)
  const term2 = params.lambda * params.Cost_eth_1_sum
  return Number((term1 + term2).toFixed(6))
}

export function weaveContext(params: ContextWeaverParams): ContextWeaverResult {
  const gS2 = calculateGS2(params)
  const v2 = calculateV2(params, gS2)
  const costEth2 = calculateCostEth2(params, gS2)
  const cutFractal = params.Phi_fractal_field * gS2
  const sewSemantic = params.Psi_co_2
  const embedEthical = v2
  const loopResonance = params.resonance * gS2
  const W_context_2 = Number((cutFractal * sewSemantic + embedEthical * loopResonance).toFixed(6))
  const opt = Number(
    (
      safeDivide(params.Phi_fractal_field * params.Phi_universal_cohesion, Math.max(costEth2, 0.0001)) *
      params.absolute_contextuality
    ).toFixed(6)
  )
  const completion = params.S_2 === 0 && v2 >= 0.999 && params.Phi_universal_cohesion >= 0.999

  return {
    status: "CONTEXT_WEAVING_COMPLETE",
    completion_condition_met: completion,
    W_context_2,
    opt_A_MMSS: opt,
    metrics: {
      G_S_2: gS2,
      V_2: v2,
      Cost_eth_2: costEth2,
      Phi_universal_cohesion: Number(params.Phi_universal_cohesion.toFixed(4)),
      absolute_contextuality: Number(params.absolute_contextuality.toFixed(4)),
    },
    verification: {
      method: "Phi_Cohesion_Measurement_V2.0",
      success_criteria: completion ? "UNIVERSAL_COHESION_ACHIEVED" : "IN_PROGRESS",
      final_state: completion ? "SEMANTIC_CONDENSATE_ACHIEVED_Df2_INF_PHI" : "WEAVING",
    },
  }
}
