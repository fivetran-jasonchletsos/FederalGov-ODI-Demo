import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatCurrencyShort, formatNumber, formatPercent } from '../api/queries';
import type { Summary, Beneficiaries, Fraud, Security, Mission } from '../api/queries';
import { UsHeatmap } from '../components/UsHeatmap';

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bens, setBens] = useState<Beneficiaries | null>(null);
  const [fraud, setFraud] = useState<Fraud | null>(null);
  const [sec, setSec] = useState<Security | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    api.summary().then(setSummary);
    api.beneficiaries().then(setBens);
    api.fraud().then(setFraud);
    api.security().then(setSec);
    api.mission().then(setMission);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header band */}
      <section>
        <div className="eyebrow mb-1">Director's Dashboard, Fiscal Year {summary?.fiscal_year ?? '—'}</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink-strong)] tracking-tight">
          State of the Bureau, single source of truth on the gold layer.
        </h1>
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)] leading-relaxed">
          The Office of the CDO and the Office of the CISO operate from one governed lakehouse.
          Connectors land data inside the FedRAMP authorization boundary. dbt builds the semantic
          layer. Snowflake GovCloud and Apache Iceberg make the gold tables addressable by every
          downstream engine and agent that needs them.
        </p>
      </section>

      {/* KPI tiles */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(summary?.tiles ?? []).map((t) => {
            const isStr = typeof t.value === 'string';
            const dir = t.delta_yoy_pct === undefined ? 'flat' : t.delta_yoy_pct > 0 ? (t.key === 'avg_decision_days' || t.key === 'open_critical_vulns' ? 'down' : 'up') : 'down';
            const tone = t.key === 'fisma_status' ? 'navy' : t.key === 'open_critical_vulns' ? (Number(t.value) > 0 ? 'warn' : '') : '';
            return (
              <div key={t.key} className={`kpi-tile ${tone}`}>
                <div className="kpi-label">{t.label}</div>
                <div className="kpi-value">
                  {isStr ? t.value : t.unit === 'usd' ? formatCurrencyShort(Number(t.value)) : t.unit === 'days' ? `${t.value} d` : formatNumber(Number(t.value))}
                </div>
                {t.delta_yoy_pct !== undefined && (
                  <div className={`kpi-delta ${dir}`}>
                    {formatPercent(t.delta_yoy_pct)} YoY
                  </div>
                )}
                {t.ato_expires && (
                  <div className="kpi-delta flat">ATO expires {t.ato_expires}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 3 items on the CDO's desk */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="eyebrow">On the CDO's desk this morning</div>
            <h2 className="font-serif text-2xl text-[var(--ink-strong)]">Three signals that need a decision</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="research-card p-5 border-l-4" style={{ borderLeftColor: 'var(--red)' }}>
            <span className="status-pill red">Improper payments</span>
            <h3 className="font-serif text-lg mt-3 text-[var(--ink-strong)]">Synthetic-identity spike in two states</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              {fraud ? formatNumber(fraud.schemes[0].programs_affected.length) : '—'} programs affected.
              The integrity agent has queued 412 applications for hold pending Treasury IPP secondary validation.
              Projected recovery {fraud ? formatCurrencyShort(fraud.agent_queue[0].potential_recovery_usd) : '—'}.
            </p>
            <Link to="/improper-payments" className="mt-3 inline-block text-[13px] font-semibold text-[var(--red-dim)] hover:underline">Review agent queue &rarr;</Link>
          </article>

          <article className="research-card p-5 border-l-4" style={{ borderLeftColor: 'var(--amber)' }}>
            <span className="status-pill amber">FISMA</span>
            <h3 className="font-serif text-lg mt-3 text-[var(--ink-strong)]">Continuous monitoring alert</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              {sec ? sec.continuous_monitoring.controls_passing_pct.toFixed(1) : '—'}% control pass rate over the last 30 days.
              {sec ? ` ${sec.continuous_monitoring.poam_open_high} ` : ' — '} high-severity POA&amp;M items open.
              Critical vulnerability MTTR within SLA.
            </p>
            <Link to="/security" className="mt-3 inline-block text-[13px] font-semibold text-[var(--amber-dim)] hover:underline">Open ATO posture &rarr;</Link>
          </article>

          <article className="research-card p-5 border-l-4" style={{ borderLeftColor: 'var(--navy)' }}>
            <span className="status-pill navy">Mission performance</span>
            <h3 className="font-serif text-lg mt-3 text-[var(--ink-strong)]">Workforce ROI trending up</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              Cybersecurity and skilled-trades cohorts are pulling the agency-wide 180-day employment rate to
              {mission ? ` ${mission.strategic_goals[2].actual}` : ' —'}.
              Tribal Workforce Compact is the laggard at 51 percent certification.
            </p>
            <Link to="/mission" className="mt-3 inline-block text-[13px] font-semibold text-[var(--navy)] hover:underline">Mission detail &rarr;</Link>
          </article>
        </div>
      </section>

      {/* Map + problem programs */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {bens && <UsHeatmap data={bens.geography.map((g) => ({ state: g.state, value: g.beneficiaries }))} valueLabel="Active beneficiaries" />}
        </div>
        <div className="research-card overflow-hidden">
          <div className="research-card-header">
            <div className="eyebrow">Top problem programs</div>
            <h3 className="font-serif text-lg text-[var(--ink-strong)]">Requires program-office intervention</h3>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)] max-h-[460px] overflow-y-auto">
            {(bens?.problem_programs ?? []).slice(0, 8).map((p, i) => (
              <li key={i} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-serif text-sm font-semibold text-[var(--ink-strong)] truncate">{p.program}</div>
                  <span className={`status-pill ${p.priority === 'high' ? 'red' : p.priority === 'medium' ? 'amber' : 'neutral'}`}>{p.priority}</span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--ink-muted)] leading-relaxed">{p.issue}</p>
                <div className="mt-1 text-[11px] text-[var(--ink-soft)] tabular">Owner: {p.owner}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer call-out */}
      <section className="research-card p-6 border-l-4" style={{ borderLeftColor: 'var(--red)' }}>
        <div className="eyebrow">How this dashboard exists</div>
        <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed max-w-4xl">
          Every tile on this page is read from one governed gold-layer Iceberg table, populated by
          Fivetran connectors operating inside the BFO authorization boundary and modeled in dbt.
          Snowflake GovCloud queries the same files that any other authorized federal compute engine
          can read. One source of truth, addressable by humans on this page and by the integrity
          agent on the Improper Payments view.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/architecture" className="status-pill navy">ODI Architecture</Link>
          <Link to="/pipeline" className="status-pill neutral">Pipeline status</Link>
          <Link to="/about" className="status-pill amber">The ODI story</Link>
        </div>
      </section>
    </div>
  );
}
