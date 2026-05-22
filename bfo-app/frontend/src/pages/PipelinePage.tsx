import { useEffect, useState } from 'react';
import { api, formatBytes, formatNumber, fivetranConnectorUrl } from '../api/queries';
import type { Pipeline } from '../api/queries';

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => { api.pipeline().then(setPipeline); }, []);

  function simulateFailure() {
    setFailed('Treasury IPP improper-payment feed');
    setTimeout(() => setFailed(null), 8000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="eyebrow mb-1">Pipeline Operations</div>
          <h1 className="font-sans text-3xl text-[var(--ink-strong)]">Connectors, layers, and dbt</h1>
          <p className="mt-2 max-w-3xl text-[var(--ink-muted)] text-sm leading-relaxed">
            Every connector below operates inside the BFO FedRAMP High authorization boundary. The
            ingest path is Fivetran into Iceberg on BFO-controlled S3 in GovCloud. dbt builds four
            layered marts on Snowflake GovCloud.
          </p>
        </div>
        <button
          onClick={simulateFailure}
          className="inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider border border-[var(--red)]/40 text-[var(--red-dim)] bg-[var(--red-bg)] hover:bg-[var(--red)]/15"
        >
          Simulate connector failure
        </button>
      </header>

      <section>
        <div className="section-head">
          <h2 className="font-sans text-xl font-bold text-[var(--ink-strong)]">Connectors</h2>
        </div>
        <div className="research-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="fed-thead">
              <tr>
                <th className="text-left px-4 py-2.5">Source</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Fivetran ID</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Rows / hr</th>
                <th className="text-right px-4 py-2.5">Lag</th>
                <th className="text-left px-4 py-2.5">Boundary</th>
                <th className="text-left px-4 py-2.5">Fivetran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(pipeline?.connectors ?? []).map((c) => {
                const isFailed = failed && c.name.includes('Treasury IPP');
                const status = isFailed ? 'failed' : c.status;
                const cls = status === 'running' ? 'green' : status === 'degraded' ? 'amber' : 'red';
                return (
                  <tr key={c.name} className="hover:bg-[var(--paper)]">
                    <td className="px-4 py-3 font-sans font-semibold text-[var(--ink-strong)] text-sm">{c.name}</td>
                    <td className="px-4 py-3 ticker text-[11px] text-[var(--ink-muted)]">{c.type}</td>
                    <td className="px-4 py-3">
                      <span className="fivetran-id-chip">{c.fivetran_id}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`status-pill ${cls}`}>{status}</span></td>
                    <td className="px-4 py-3 text-right tabular text-sm">{formatNumber(c.rows_per_hour)}</td>
                    <td className="px-4 py-3 text-right tabular text-[var(--ink-muted)] text-sm">{isFailed ? '—' : `${c.lag_seconds}s`}</td>
                    <td className="px-4 py-3 ticker text-[11px] text-[var(--ink-soft)]">{c.boundary}</td>
                    <td className="px-4 py-3">
                      <a
                        href={fivetranConnectorUrl(c.fivetran_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="fivetran-cta"
                      >
                        Open in Fivetran
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 10L10 2M5 2h5v5" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {failed && (
          <div className="mt-3 research-card p-4 border-l-4" style={{ borderLeftColor: 'var(--red)' }}>
            <div className="eyebrow" style={{ color: 'var(--red-dim)' }}>Incident response</div>
            <p className="text-sm text-[var(--ink-muted)] mt-1 leading-relaxed">
              <strong className="text-[var(--ink-strong)]">Fivetran has paused the {failed} connector.</strong>{' '}
              Iceberg time-travel preserves the last good snapshot. Downstream dbt models pin to the
              last successful build until the source recovers. No partial writes reach the gold tier.
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="section-head">
            <h2 className="font-sans text-xl font-bold text-[var(--ink-strong)]">Layers</h2>
          </div>
          <div className="space-y-3">
            {(pipeline?.layers ?? []).map((l) => (
              <div key={l.layer} className="research-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-sans font-semibold text-[var(--ink-strong)]">{l.layer}</div>
                  <div className="ticker text-[11px] text-[var(--ink-soft)]">{formatNumber(l.tables)} tables</div>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-3 text-[12px] text-[var(--ink-muted)]">
                  <div><span className="text-[var(--ink-soft)]">Rows</span> <span className="tabular text-[var(--ink-strong)]">{formatNumber(l.rows)}</span></div>
                  <div><span className="text-[var(--ink-soft)]">Size</span> <span className="tabular text-[var(--ink-strong)]">{formatBytes(l.size_bytes)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-head">
            <h2 className="font-sans text-xl font-bold text-[var(--ink-strong)]">dbt runs, last 24 hours</h2>
          </div>
          <div className="space-y-3">
            {(pipeline?.dbt_runs_24h ?? []).map((r) => {
              const cls = r.status === 'success' ? 'green' : r.status === 'success_with_warnings' ? 'amber' : 'red';
              return (
                <div key={r.run_id} className="research-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="ticker text-[12px] text-[var(--ink-strong)]">{r.run_id}</div>
                    <span className={`status-pill ${cls}`}>{r.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-[12px] text-[var(--ink-muted)]">
                    <div><span className="text-[var(--ink-soft)]">Models</span> <span className="tabular text-[var(--ink-strong)]">{r.models}</span></div>
                    <div><span className="text-[var(--ink-soft)]">Duration</span> <span className="tabular text-[var(--ink-strong)]">{r.duration_seconds}s</span></div>
                    <div><span className="text-[var(--ink-soft)]">Tests</span> <span className="tabular text-[var(--ink-strong)]">{r.tests_passed}/{r.tests_passed + r.tests_failed}</span></div>
                  </div>
                  {r.warnings?.length ? (
                    <div className="mt-2 text-[11px] text-[var(--amber-dim)]">Warnings: {r.warnings.join('; ')}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="research-card p-5 border-l-4" style={{ borderLeftColor: 'var(--navy)' }}>
        <div className="eyebrow">Architecture note</div>
        <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">
          All connectors and compute resources operate inside the BFO FedRAMP High authorization
          boundary. Fivetran writes Iceberg directly into bfo-odi-lake-gov in GovCloud. Snowflake
          Polaris catalogs the tables. Snowflake GovCloud and federated agency readers query the
          same files. No data leaves the boundary, and no engine holds a private copy.
        </p>
      </section>
    </div>
  );
}
