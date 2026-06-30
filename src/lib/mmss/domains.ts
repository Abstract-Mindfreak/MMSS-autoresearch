export interface DomainProfile {
  name: string
  dF: number
  subdomains?: string[]
}

export const DOMAIN_PROFILES: DomainProfile[] = [
  { name: "MMSS", dF: 9.9, subdomains: ["MMSS Engineering", "MMSS Cataloging"] },
  { name: "Financial Analysis", dF: 7.2, subdomains: ["Technical Analysis", "Fundamental Analysis", "Portfolio Risk"] },
  { name: "Investment Management", dF: 7.5, subdomains: ["Asset Allocation", "Factor Models", "Macro Positioning"] },
  { name: "Risk Management", dF: 7.0, subdomains: ["Operational Risk", "Market Risk", "Scenario Analysis"] },
  { name: "Biotech R&D", dF: 8.5, subdomains: ["Protein Synthesis", "Cell Engineering", "Biomaterials"] },
  { name: "Drug Discovery", dF: 8.5, subdomains: ["Compound Discovery", "Clinical Trials", "Pharmacokinetics"] },
  { name: "Genome Analysis", dF: 9.0, subdomains: ["Variant Calling", "Population Genomics", "Disease Markers"] },
  { name: "Bioinformatics", dF: 8.6, subdomains: ["Sequence Analysis", "Proteomics", "Systems Biology"] },
  { name: "Logistics Optimization", dF: 6.8, subdomains: ["Routing", "Warehouse Flow", "International Logistics"] },
  { name: "Supply Chain Management", dF: 7.0, subdomains: ["Demand Forecasting", "Procurement", "Cold Chain"] },
  { name: "Scientific Research", dF: 8.5, subdomains: ["Hypothesis Design", "Methodology", "Replication"] },
  { name: "Climate Modeling", dF: 8.8, subdomains: ["Weather Forecasting", "Ocean Models", "Geoengineering"] },
  { name: "Quantum Physics", dF: 9.5, subdomains: ["State Evolution", "Quantum Systems", "Measurement"] },
  { name: "Machine Learning", dF: 7.5, subdomains: ["Deep Learning", "Reinforcement Learning", "AutoML"] },
  { name: "Natural Language Processing", dF: 7.8, subdomains: ["Prompting", "Semantic Search", "Information Extraction"] },
  { name: "Cybersecurity", dF: 7.0, subdomains: ["Threat Analysis", "Malware", "Vulnerability Management"] },
  { name: "Renewable Energy", dF: 7.5, subdomains: ["Grid Balancing", "Storage", "Production Forecasting"] },
  { name: "Industrial Manufacturing", dF: 6.8, subdomains: ["Quality Control", "Predictive Maintenance", "Process Flow"] },
  { name: "Generative Design", dF: 8.0, subdomains: ["AI Art", "3D Modeling", "Procedural Design"] },
  { name: "Robotics", dF: 7.5, subdomains: ["Autonomous Systems", "Industrial Robotics", "Swarm Coordination"] },
]

export function getDomainDF(name: string) {
  return DOMAIN_PROFILES.find((entry) => entry.name === name)?.dF ?? 5.0
}

export function getDomainSubdomains(name: string) {
  return DOMAIN_PROFILES.find((entry) => entry.name === name)?.subdomains ?? []
}
