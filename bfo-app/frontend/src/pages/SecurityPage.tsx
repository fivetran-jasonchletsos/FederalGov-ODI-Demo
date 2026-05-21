import { useEffect, useState } from 'react';
import { api, formatNumber } from '../api/queries';
import type { Security } from '../api/queries';

export default function SecurityPage() {
  const [sec, setSec] = useState<Security | null>(null);
  useEffect(() => { api.security().then(setSec); }, []);

  if (!sec) return <div className="mx-auto max-w-7xl px-4 py-12 text-[var(--ink-muted)]">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <header>
        <div className="eyebrow mb-1">Authority to Operate Lifecycle</div>
        <h1 className="font-serif text-3xl text-[var(--ink-strong)]">FISMA continuous monitoring</h1>
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)] leading-relaxed">
          The BFO ODI Lakehouse operates under a single FedRAMP High Authority to Operate. The CISO
          reviews the same gold-tier security facts the CDO reviews for program performance, queried
          through the same Snowflake GovCloud compute engine.
        </p>
      </header>

      {/* ATO band */}
      <section className="research-card p-6" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--navy)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <div className="kpi-label">ATO status</div>
            <div className="font-serif text-2xl font-bold text-[var(--ink-strong)] mt-1">{sec.fisma.ato_status}</div>
            <div className="text-[12px] text-[var(--ink-muted)] mt-1">{sec.fisma.impact_level}</div>
          </div>
          <div>
            <div className="kpi-label">Issued</div>
            <div className="font-serif text-lg text-[var(--ink-strong)] mt-1">{sec.fisma.ato_issued}</div>
            <div className="text-[12px] text-[var(--ink-muted)] mt-1">by {sec.fisma.ato_authority}</div>
          </div>
          <div>
            <div className="kpi-label">Expires</div>
            <div className="font-serif text-lg text-[var(--ink-strong)] mt-1">{sec.fisma.ato_expires}</div>
            <div className="text-[12px] text-[var(--ink-muted)] mt-1">Annual reassessment in progress</div>
          </div>
          <div>
            <div className="kpi-label">Continuous monitoring</div>
            <div className="font-serif text-2xl font-bold text-[var(--green)] mt-1">{sec.continuous_monitoring.controls_passing_pct}%</div>
            <div className="text-[12px] text-[var(--ink-muted)] mt-1">{sec.continuous_monitoring.controls_assessed_30d} controls assessed, 30 days</div>
          </div>
        </div>
        <div className="mt-5 rounded-sm bg-[var(--paper-deep)] border border-[var(--hairline)] p-4 text-[13px] text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">System boundary.</strong> {sec.fisma.system_boundary}
        </div>
      </section>

      {/* POA&M and vulnerabilities */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="research-card p-5">
          <div className="eyebrow">POA&amp;M</div>
          <h3 className="font-serif text-lg text-[var(--ink-strong)]">Plan of Action and Milestones</h3>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="kpi-tile"><div className="kpi-label">Open</div><div className="kpi-value">{sec.continuous_monitoring.poam_open}</div></div>
            <div className="kpi-tile warn"><div className="kpi-label">High</div><div className="kpi-value">{sec.continuous_monitoring.poam_open_high}</div></div>
            <div className="kpi-tile"><div className="kpi-label">Critical</div><div className="kpi-value">{sec.continuous_monitoring.poam_open_critical}</div></div>
          </div>
          <div className="mt-3 text-[12px] text-[var(--ink-soft)] ticker">Last assessment {sec.continuous_monitoring.last_assessment}</div>
        </div>

        <div className="research-card overflow-hidden">
          <div className="research-card-header">
            <div className="eyebrow">Vulnerabilities by severity</div>
            <h3 className="font-serif text-lg text-[var(--ink-strong)]">Patch SLA compliance</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-soft)] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="text-left px-4 py-2">Severity</th>
                <th className="text-right px-4 py-2">Open</th>
                <th className="text-right px-4 py-2">MTTR</th>
                <th className="text-right px-4 py-2">SLA</th>
                <th className="text-right px-4 py-2">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {sec.vulnerabilities.map((v) => (
                <tr key={v.severity}>
                  <td className="px-4 py-2"><span className={`status-pill ${v.severity === 'Critical' ? 'red' : v.severity === 'High' ? 'amber' : 'neutral'}`}>{v.severity}</span></td>
                  <td className="px-4 py-2 text-right tabular">{v.open}</td>
                  <td className="px-4 py-2 text-right tabular">{v.mttr_days.toFixed(1)} d</td>
                  <td className="px-4 py-2 text-right tabular text-[var(--ink-muted)]">{v.sla_days} d</td>
                  <td className="px-4 py-2 text-right tabular font-semibold">{v.sla_compliance_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Patch + DLP + IAM */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="research-card p-5">
          <div className="eyebrow">Patch compliance</div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-[12px] text-[var(--ink-muted)]">{formatNumber(sec.patch_compliance.endpoints_total)} endpoints</div>
              <div className="mt-1 h-2 rounded-sm bg-[var(--paper-deep)] overflow-hidden">
                <div className="h-full" style={{ width: `${sec.patch_compliance.endpoints_compliant_pct}%`, background: 'var(--navy)' }} />
              </div>
              <div className="text-[12px] tabular text-[var(--ink-strong)] font-semibold mt-1">{sec.patch_compliance.endpoints_compliant_pct.toFixed(1)}% compliant</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--ink-muted)]">{formatNumber(sec.patch_compliance.servers_total)} servers</div>
              <div className="mt-1 h-2 rounded-sm bg-[var(--paper-deep)] overflow-hidden">
                <div className="h-full" style={{ width: `${sec.patch_compliance.servers_compliant_pct}%`, background: 'var(--navy)' }} />
              </div>
              <div className="text-[12px] tabular text-[var(--ink-strong)] font-semibold mt-1">{sec.patch_compliance.servers_compliant_pct.toFixed(1)}% compliant</div>
            </div>
          </div>
        </div>

        <div className="research-card overflow-hidden">
          <div className="research-card-header">
            <div className="eyebrow">Data-loss prevention</div>
            <h3 className="font-serif text-lg text-[var(--ink-strong)]">Alerts, 30 days</h3>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {sec.dlp_alerts_30d.map((d) => (
              <li key={d.category} className="px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="font-serif text-sm text-[var(--ink-strong)] truncate">{d.category}</div>
                <div className="text-[11px] ticker text-[var(--ink-muted)]">
                  <span className="text-[var(--ink-strong)] font-semibold">{d.count}</span> raised, {d.blocked} blocked
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="research-card overflow-hidden">
          <div className="research-card-header">
            <div className="eyebrow">Identity & access reviews</div>
            <h3 className="font-serif text-lg text-[var(--ink-strong)]">Quarterly recertification</h3>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {sec.iam_reviews.map((r) => (
              <li key={r.scope} className="px-4 py-2.5">
                <div className="font-serif text-sm font-semibold text-[var(--ink-strong)] truncate">{r.scope}</div>
                <div className="text-[11px] ticker text-[var(--ink-muted)] mt-0.5">
                  {r.reviewed_qtd}/{r.accounts} reviewed, {r.removed} removed, last {r.last_review}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="research-card p-5">
        <div className="eyebrow">Audit-log retention</div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">Ingest lag (p95)</div>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mt-1">{sec.audit_log_retention.ingest_lag_seconds_p95} s</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">Hot retention</div>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mt-1">{sec.audit_log_retention.retention_days_hot} days</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">Archive retention</div>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mt-1">{sec.audit_log_retention.retention_days_archive} days</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">Immutability</div>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mt-1">{sec.audit_log_retention.immutability}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
