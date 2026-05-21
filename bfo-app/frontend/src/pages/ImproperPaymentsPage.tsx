import { useEffect, useState } from 'react';
import { api, formatCurrencyShort, formatNumber, formatPercent } from '../api/queries';
import type { Fraud } from '../api/queries';

export default function ImproperPaymentsPage() {
  const [fraud, setFraud] = useState<Fraud | null>(null);
  useEffect(() => { api.fraud().then(setFraud); }, []);

  if (!fraud) return <div className="mx-auto max-w-7xl px-4 py-12 text-[var(--ink-muted)]">Loading…</div>;
  const t = fraud.totals;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header>
        <div className="eyebrow mb-1">Program Integrity</div>
        <h1 className="font-serif text-3xl text-[var(--ink-strong)]">Improper payments, detected on the gold layer</h1>
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)] leading-relaxed">
          The BFO integrity agent reads the same gold facts that this dashboard shows. Recommendations
          are produced from joins across the payment ledger, Treasury IPP, SSA Death Master, GSA SAM.gov
          exclusions, and USPS NCOA deltas. Humans approve actions; the agent does not move money on its own.
        </p>
      </header>

      {/* Totals */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-tile">
          <div className="kpi-label">Flagged YTD</div>
          <div className="kpi-value">{formatCurrencyShort(t.flagged_usd_ytd)}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Recovered YTD</div>
          <div className="kpi-value">{formatCurrencyShort(t.recovered_usd_ytd)}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Prevention, avoided</div>
          <div className="kpi-value">{formatCurrencyShort(t.prevention_avoided_usd_ytd)}</div>
        </div>
        <div className="kpi-tile alert">
          <div className="kpi-label">Cases under review</div>
          <div className="kpi-value">{formatNumber(t.cases_under_review)}</div>
        </div>
      </section>

      {/* Schemes */}
      <section>
        <h2 className="font-serif text-2xl text-[var(--ink-strong)] mb-3">Top schemes</h2>
        <div className="space-y-3">
          {fraud.schemes.map((s) => (
            <article key={s.rank} className="research-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-sm flex items-center justify-center font-serif font-bold text-white shrink-0" style={{ background: 'var(--red)' }}>{s.rank}</div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-[var(--ink-strong)]">{s.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {s.programs_affected.map((p) => <span key={p} className="ticker text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--paper-deep)] text-[var(--ink-muted)] border border-[var(--hairline)]">{p}</span>)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right tabular text-sm shrink-0">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">Flagged</div>
                    <div className="font-serif font-semibold text-[var(--ink-strong)]">{formatCurrencyShort(s.flagged_usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">Recovered</div>
                    <div className="font-serif font-semibold text-[var(--green)]">{formatCurrencyShort(s.recovered_usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">QoQ trend</div>
                    <div className={`font-serif font-semibold ${s.trend_qoq_pct >= 0 ? 'text-[var(--red-dim)]' : 'text-[var(--green)]'}`}>{formatPercent(s.trend_qoq_pct)}</div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed">{s.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Agent queue */}
      <section>
        <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="eyebrow">Agents reading the gold layer</div>
            <h2 className="font-serif text-2xl text-[var(--ink-strong)]">Integrity agent queue</h2>
          </div>
          <div className="text-[12px] text-[var(--ink-soft)]">Human approval required before any action posts to the payment ledger.</div>
        </div>
        <div className="research-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-soft)] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Case ID</th>
                <th className="text-left px-4 py-2.5">Scheme</th>
                <th className="text-right px-4 py-2.5">Cases</th>
                <th className="text-right px-4 py-2.5">Potential recovery</th>
                <th className="text-left px-4 py-2.5">Recommendation</th>
                <th className="text-left px-4 py-2.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {fraud.agent_queue.map((q) => (
                <tr key={q.id} className="hover:bg-[var(--paper)] align-top">
                  <td className="px-4 py-3 ticker text-[12px] text-[var(--ink-soft)]">{q.id}</td>
                  <td className="px-4 py-3 font-serif font-semibold text-[var(--ink-strong)]">{q.scheme}</td>
                  <td className="px-4 py-3 text-right tabular">{formatNumber(q.case_count)}</td>
                  <td className="px-4 py-3 text-right tabular text-[var(--green)] font-semibold">{formatCurrencyShort(q.potential_recovery_usd)}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--ink-muted)] leading-relaxed">{q.recommendation}</td>
                  <td className="px-4 py-3"><span className="status-pill amber">{q.state}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
