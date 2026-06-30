import { getDomainDF } from "@/lib/mmss/domains"

export interface PFRMetrics {
  eta_R: number
  V: number
  delta_S: number
  cost_complexity: number
  G_S: number
  D_f: number
  Phi_Domain: number
  V_applied: number
  reorganized_complexity: number
  disintegration_index: number
  coherent_assembly: number
}

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(denominator) || denominator === 0) {
    return 0
  }
  return numerator / denominator
}

export function calculateEtaR(deltaV: number, deltaS: number, G_S: number, cost: number): number {
  return safeDivide(deltaV, deltaS) * safeDivide(G_S, cost)
}

export function calculateV(C_val: number, Phi_Domain: number, G_S: number, D_f: number, R_T: number): number {
  const denominator = G_S * D_f * R_T
  return 1 - safeDivide(C_val * Phi_Domain, denominator)
}

export function fullReassemblyCycle(domain: string, params: Record<string, number>): PFRMetrics {
  const area = params.area ?? 1
  const S = params.S ?? 0.8
  const Xi_topo = params.Xi_topo ?? 0.9
  const W = params.W ?? 0.95
  const Psi_opt = params.Psi_opt ?? 0.9
  const delta_V = params.delta_V ?? 0.6
  const delta_S = params.delta_S ?? 0.4
  const cost = params.cost ?? 1.2
  const R_T = params.R_T ?? 1.618
  const domainDf = getDomainDF(domain)
  const domainFactor = Math.max(0.5, Math.min(1.4, domainDf / 8.5))

  const disintegration_index = Number((S * W * domainFactor).toFixed(4))
  const D_f = Number((Math.max(domainDf, area * Xi_topo * domainFactor)).toFixed(4))
  const G_S = Number((W * Psi_opt * Xi_topo * domainFactor).toFixed(4))
  const Phi_Domain = Number((domainFactor * Xi_topo).toFixed(4))
  const eta_R = Number(calculateEtaR(delta_V, delta_S, G_S, cost).toFixed(4))
  const coherent_assembly = Number((Math.max(0, 1 - delta_S) * Psi_opt * R_T).toFixed(4))
  const V = Number(calculateV(S, Phi_Domain, G_S, D_f || 1, R_T || 1).toFixed(4))

  return {
    eta_R,
    V,
    delta_S: Number(delta_S.toFixed(4)),
    cost_complexity: Number(cost.toFixed(4)),
    G_S,
    D_f,
    Phi_Domain,
    V_applied: V,
    reorganized_complexity: Number((delta_S * Phi_Domain * coherent_assembly).toFixed(4)),
    disintegration_index,
    coherent_assembly,
  }
}
