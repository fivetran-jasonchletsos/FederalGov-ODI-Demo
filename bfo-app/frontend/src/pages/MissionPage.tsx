import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { api, formatCurrencyShort, formatNumber, formatPercent } from '../api/queries';
import type { Mission, Workforce } from '../api/queries';

export default function MissionPage() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [wf, setWf] = useState<Workforce | null>(null);
  useEffect(() => {
    api.mission().then(setMission);
    api.workforce().then(setWf);
  }, []);

  if (!mission || !wf) return <div className="mx-auto max-w-7xl px-4 py-12 text-[var(--ink-muted)]">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <header>
        <div className="eyebrow mb-1">OMB-Style Mission Performance</div>
        <h1 className="font-serif text-3xl text-[var(--ink-strong)]">Statement of Agency Outcomes</h1>
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)] leading-relaxed">{mission.statement_of_outcomes}</p>
      </header>

      <section>
        <h2 className="font-serif text-2xl text-[var(--ink-strong)] mb-4">Strategic goals vs targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mission.strategic_goals.map((g) => {
            const ahead = g.performance_pct >= 100;
            return (
              <div key={g.code} className={`research-card p-5 border-l-4`} style={{ borderLeftColor: ahead ? 'var(--green)' : 'var(--amber)' }}>
                <div className="ticker text-[11px] text-[var(--ink-soft)]">{g.code}</div>
                <h3 className="font-serif text-base font-semibold mt-1 text-[var(--ink-strong)]">{g.name}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <div className="uppercase tracking-wider text-[10px] text-[var(--ink-soft)]">Target</div>
                    <div className="text-[var(--ink-strong)] font-semibold">{g.target}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[10px] text-[var(--ink-soft)]">Actual</div>
                    <div className="text-[var(--ink-strong)] font-semibold">{g.actual}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={`status-pill ${ahead ? 'green' : 'amber'}`}>{g.performance_pct.toFixed(0)}% of target</span>
                  <span className="text-[11px] text-[var(--ink-soft)]">{g.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--ink-strong)] mb-4">Appropriation execution, current fiscal year</h2>
        <div className="research-card p-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mission.appropriation_execution} layout="vertical" margin={{ left: 80, right: 24 }}>
              <CartesianGrid stroke="#e7e3d6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => formatCurrencyShort(v as number)} />
              <YAxis dataKey="account" type="category" width={170} tick={{ fontSize: 11, fill: '#1f2937' }} />
              <Tooltip formatter={(v) => formatCurrencyShort(Number(v))} />
              <Bar dataKey="appropriated_usd" fill="#cbd5e0" name="Appropriated" />
              <Bar dataKey="executed_usd" fill="#1a365d" name="Executed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="research-card p-5">
          <h2 className="font-serif text-xl text-[var(--ink-strong)] mb-2">Workforce 180-day employment trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={wf.trend}>
              <CartesianGrid stroke="#e7e3d6" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[50, 70]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Line type="monotone" dataKey="employment_pct" stroke="#1a365d" strokeWidth={2} dot={{ r: 3, fill: '#c53030' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="research-card overflow-hidden">
          <div className="research-card-header">
            <div className="eyebrow">Congressional reporting</div>
            <h3 className="font-serif text-lg text-[var(--ink-strong)]">Reports due, next 90 days</h3>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {mission.congressional_reporting.map((r) => (
              <li key={r.report} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-serif text-sm font-semibold text-[var(--ink-strong)]">{r.report}</div>
                  <div className="text-[11px] text-[var(--ink-soft)] ticker">Due {r.due}</div>
                </div>
                <span className={`status-pill ${r.status === 'On track' ? 'green' : r.status === 'Compiling' ? 'amber' : 'navy'}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--ink-strong)] mb-4">Workforce-program outcomes</h2>
        <div className="research-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-soft)] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Program</th>
                <th className="text-right px-4 py-2.5">Enrolled</th>
                <th className="text-right px-4 py-2.5">Certified</th>
                <th className="text-right px-4 py-2.5">Employed 180d</th>
                <th className="text-right px-4 py-2.5">Median wage gain</th>
                <th className="text-right px-4 py-2.5">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {wf.programs.map((p) => (
                <tr key={p.code} className="hover:bg-[var(--paper)]">
                  <td className="px-4 py-2.5">
                    <div className="font-serif font-semibold text-[var(--ink-strong)]">{p.name}</div>
                    <div className="ticker text-[10px] text-[var(--ink-soft)]">{p.code}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">{formatNumber(p.enrolled)}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatNumber(p.certified)}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatNumber(p.employed_180d)}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatCurrencyShort(p.median_wage_gain_usd)}</td>
                  <td className="px-4 py-2.5 text-right tabular font-semibold text-[var(--green)]">{p.roi_ratio.toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[var(--ink-soft)]">
          Agency-wide 180-day employment outcome {formatPercent(wf.summary.employment_outcome_pct - 0)} ({wf.summary.employment_outcome_pct.toFixed(1)}%).
          Median wage gain {formatCurrencyShort(wf.summary.median_wage_gain_usd)} per certified trainee.
        </p>
      </section>
    </div>
  );
}
