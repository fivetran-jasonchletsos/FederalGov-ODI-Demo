// Read static JSON snapshots produced from the gold layer.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return (await res.json()) as T;
}

const cache = new Map<string, Promise<unknown>>();
function load<T>(path: string): Promise<T> {
  if (!cache.has(path)) cache.set(path, fetchJson<T>(path));
  return cache.get(path) as Promise<T>;
}

export const api = {
  summary:   () => load<Summary>('/data/summary.json'),
  beneficiaries: () => load<Beneficiaries>('/data/beneficiaries.json'),
  programs:  () => load<Programs>('/data/programs.json'),
  fraud:     () => load<Fraud>('/data/fraud_improper.json'),
  workforce: () => load<Workforce>('/data/workforce.json'),
  security:  () => load<Security>('/data/security.json'),
  mission:   () => load<Mission>('/data/mission_performance.json'),
  pipeline:  () => load<Pipeline>('/data/pipeline.json'),
  iceberg:   () => load<Iceberg>('/data/iceberg.json'),
};

// Format helpers
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}
export function formatCurrencyShort(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(abs >= 100_000_000_000 ? 0 : 1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 100_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}
export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1024 ** 4) return `${(n / 1024 ** 4).toFixed(2)} TB`;
  if (abs >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (abs >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (abs >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}
export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
}

// Types
export interface SummaryTile {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  delta_yoy_pct?: number;
  ato_expires?: string;
}
export interface Summary {
  generated_at: string;
  agency: string;
  agency_short: string;
  fiscal_year: number;
  tiles: SummaryTile[];
}
export interface Beneficiaries {
  applications_received_ytd: number;
  applications_decided_ytd: number;
  sla_target_days: number;
  sla_compliance_pct: number;
  denial_rate_pct: number;
  by_program_denial: { program: string; denial_rate_pct: number; decisions_ytd: number }[];
  problem_programs: { program: string; issue: string; owner: string; priority: 'high' | 'medium' | 'low' }[];
  geography: { state: string; beneficiaries: number; outlays_ytd: number }[];
}
export interface Programs {
  programs: {
    code: string; name: string; category: string;
    outlays_ytd: number; beneficiaries: number;
    improper_payment_rate_pct: number; gao_audit_status: string;
    appropriation_pct_executed: number;
  }[];
}
export interface Fraud {
  totals: { flagged_usd_ytd: number; recovered_usd_ytd: number; prevention_avoided_usd_ytd: number; cases_under_review: number };
  schemes: { rank: number; name: string; flagged_usd: number; recovered_usd: number; trend_qoq_pct: number; programs_affected: string[]; description: string }[];
  agent_queue: { id: string; scheme: string; case_count: number; potential_recovery_usd: number; recommendation: string; state: string }[];
}
export interface Workforce {
  summary: { programs_delivered_ytd: number; trainees_enrolled_ytd: number; certifications_issued_ytd: number; employment_outcome_pct: number; median_wage_gain_usd: number; roi_ratio: number };
  programs: { code: string; name: string; enrolled: number; certified: number; employed_180d: number; median_wage_gain_usd: number; roi_ratio: number }[];
  trend: { period: string; employment_pct: number }[];
}
export interface Security {
  fisma: { ato_status: string; ato_authority: string; ato_issued: string; ato_expires: string; impact_level: string; system_boundary: string };
  continuous_monitoring: { controls_assessed_30d: number; controls_passing_pct: number; poam_open: number; poam_open_critical: number; poam_open_high: number; last_assessment: string };
  vulnerabilities: { severity: string; open: number; mttr_days: number; sla_days: number; sla_compliance_pct: number }[];
  patch_compliance: { endpoints_total: number; endpoints_compliant_pct: number; servers_total: number; servers_compliant_pct: number };
  dlp_alerts_30d: { category: string; count: number; blocked: number; investigated: number }[];
  iam_reviews: { scope: string; accounts: number; reviewed_qtd: number; removed: number; last_review: string }[];
  audit_log_retention: { ingest_lag_seconds_p95: number; retention_days_hot: number; retention_days_archive: number; immutability: string };
}
export interface Mission {
  statement_of_outcomes: string;
  strategic_goals: { code: string; name: string; target: string; actual: string; trend: string; performance_pct: number }[];
  appropriation_execution: { account: string; appropriated_usd: number; executed_usd: number; execution_pct: number }[];
  congressional_reporting: { report: string; due: string; status: string }[];
}
export interface Pipeline {
  connectors: { name: string; type: string; status: string; rows_per_hour: number; lag_seconds: number; boundary: string; incident?: string }[];
  layers: { layer: string; tables: number; rows: number; size_bytes: number; last_built: string }[];
  dbt_runs_24h: { run_id: string; status: string; models: number; duration_seconds: number; tests_passed: number; tests_failed: number; warnings?: string[] }[];
}
export interface Iceberg {
  catalog: string;
  boundary: string;
  tables: { namespace: string; name: string; rows: number; size_bytes: number; partition: string; last_compaction: string }[];
}
