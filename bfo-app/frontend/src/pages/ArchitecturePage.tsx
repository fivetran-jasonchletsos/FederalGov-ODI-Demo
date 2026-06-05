import { useEffect, useState } from 'react';
import { api, formatBytes, formatNumber } from '../api/queries';
import type { Iceberg, Pipeline } from '../api/queries';
import { AliveMedallion, type SourceNode, type EngineNode, type ConsumerRole } from '../components/AliveMedallion';

// Federal civilian — benefits, improper payments, FISMA. Mirrors the
// Clarity / Verity / Altavest mapping so AliveMedallion renders the same
// SOURCES / LAKEHOUSE / CONSUMERS triptych with federal copy.
const FED_SOURCES: SourceNode[] = [
  { id: 'ben',   label: 'Benefits Eligibility', sub: 'SQL Server log-CDC',     logo: 'sqlserver', freshness: '52s lag',  status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/incidentally_tangent' },
  { id: 'case',  label: 'Case Management',      sub: 'Oracle Binary Log Reader',         logo: 'oracle',    freshness: '3 min lag', status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/entreaty_historical' },
  { id: 'feed',  label: 'Federal Data Feed',    sub: 'Real-time event stream', logo: 'hl7',       freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'audit', label: 'OIG / GAO Audits',     sub: 'Quarterly regulatory',   logo: 'cms',       freshness: '14d lag',   status: 'healthy' },
];

const FED_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true, logo: 'snowflake' },
  { name: 'Athena',                  logo: 'athena' },
  { name: 'DuckDB',                  logo: 'duckdb' },
  { name: 'Trino',                   logo: 'trino' },
  { name: 'Spark',                   logo: 'spark' },
];

const FED_ROLES: ConsumerRole[] = [
  { label: 'Program Officers', sub: 'eligibility & throughput' },
  { label: 'Investigators',    sub: 'fraud & improper payments' },
  { label: 'Auditors',         sub: 'GAO & IG ready' },
  { label: 'IT Security',      sub: 'FISMA & ATO' },
];

const SOURCES = [
  { name: 'BENS Mainframe', subtitle: 'Cobol-era benefits engine', connector: 'Fivetran HVR (CDC)', color: '#1a365d' },
  { name: 'ServiceNow', subtitle: 'Case management', connector: 'Fivetran SaaS connector', color: '#2c5282' },
  { name: 'Salesforce PSC', subtitle: 'Public Sector Cloud', color: '#2c5282', connector: 'Fivetran SaaS connector' },
  { name: 'Workday HCM', subtitle: 'Federal workforce', color: '#2c5282', connector: 'Fivetran SaaS connector' },
  { name: 'GSA SAM.gov', subtitle: 'Vendor eligibility', color: '#9b2c2c', connector: 'Fivetran Connector SDK' },
  { name: 'Treasury IPP', subtitle: 'Improper-payments feed', color: '#9b2c2c', connector: 'Fivetran Connector SDK' },
  { name: 'CISA threat-intel', subtitle: 'Cyber indicators', color: '#9b2c2c', connector: 'Fivetran Connector SDK' },
  { name: 'USPS NCOA', subtitle: 'Address-of-record', color: '#9b2c2c', connector: 'Fivetran Connector SDK' },
];

export default function ArchitecturePage() {
  const [iceberg, setIceberg] = useState<Iceberg | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  useEffect(() => {
    api.iceberg().then(setIceberg);
    api.pipeline().then(setPipeline);
  }, []);

  // Roll the live pipeline.layers into LayerStat-shaped objects for the
  // AliveMedallion cylinders. If the snapshot hasn't landed yet, fall back
  // to representative numbers so the diagram still renders cleanly.
  const layerStat = (name: 'bronze' | 'silver' | 'gold', fallback: { tables: number; rows: number; bytes: number }) => {
    const row = pipeline?.layers?.find((l) => l.layer.toLowerCase() === name);
    return row
      ? { tables: row.tables, rows: row.rows, bytes: row.size_bytes }
      : fallback;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <header>
        <div className="eyebrow mb-1">Reference Architecture</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink-strong)]">One authorization boundary, every workload</h1>
        <p className="mt-3 max-w-3xl text-[var(--ink-muted)] leading-relaxed">
          Sources land inside the BFO FedRAMP High authorization boundary. Fivetran writes Apache
          Iceberg directly into BFO-controlled S3 in GovCloud. Snowflake Polaris catalogs the tables.
          Snowflake GovCloud, dbt, federated agency readers, and the integrity agent all read the
          same governed gold layer.
        </p>
      </header>

      {/* Alive medallion — three-zone SOURCES / LAKEHOUSE / CONSUMERS view */}
      <section className="research-card p-6">
        <div className="eyebrow mb-1">Data Flow</div>
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] mb-6">
          From four federal source systems to one governed gold layer
        </h2>
        <AliveMedallion
          sources={FED_SOURCES}
          bronze={layerStat('bronze', { tables: 9, rows: 42_180_000, bytes: 14_200_000_000 })}
          silver={layerStat('silver', { tables: 6, rows: 28_140_000, bytes: 8_400_000_000 })}
          gold={layerStat('gold',     { tables: 8, rows: 12_460_000, bytes: 2_980_000_000 })}
          engines={FED_ENGINES}
          roles={FED_ROLES}
          accent="#c9851a"
        />
      </section>

      {/* Sources -> Fivetran -> Iceberg -> Snowflake GovCloud */}
      <section className="research-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Sources column */}
          <div className="lg:col-span-4">
            <div className="eyebrow mb-3">Source systems</div>
            <ul className="space-y-2">
              {SOURCES.map((s) => (
                <li key={s.name} className="flex items-start gap-3 p-3 border border-[var(--hairline)] rounded-sm bg-white">
                  <span className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" style={{ background: s.color }} />
                  <div className="min-w-0">
                    <div className="font-serif font-semibold text-sm text-[var(--ink-strong)]">{s.name}</div>
                    <div className="text-[12px] text-[var(--ink-muted)]">{s.subtitle}</div>
                    <div className="text-[11px] text-[var(--ink-soft)] mt-1 ticker">{s.connector}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Lineage column */}
          <div className="lg:col-span-8 flex flex-col gap-4 justify-between">
            <div className="bg-[var(--navy)] text-white p-5 rounded-sm">
              <div className="eyebrow-light mb-1">Within the BFO ATO</div>
              <h3 className="font-serif text-xl">Fivetran lands open table format directly</h3>
              <p className="mt-2 text-[13px] text-white/80 leading-relaxed">
                HVR for the Cobol mainframe. SaaS connectors for ServiceNow, Salesforce PSC, and
                Workday HCM. Connector SDK builds for GSA SAM.gov, Treasury IPP, CISA, and USPS NCOA.
                Every connector runs inside the BFO authorization boundary; data does not leave the
                FedRAMP High perimeter.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="research-card p-4">
                <div className="layer-chip bronze inline-flex">Bronze</div>
                <div className="font-serif font-semibold mt-2 text-[var(--ink-strong)]">Raw, immutable</div>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">Source-shaped Iceberg tables, append-only, time-travel retained for audit.</p>
              </div>
              <div className="research-card p-4">
                <div className="layer-chip silver inline-flex">Silver</div>
                <div className="font-serif font-semibold mt-2 text-[var(--ink-strong)]">Conformed</div>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">dbt models normalize keys across BENS, Workday, Salesforce PSC, and external feeds.</p>
              </div>
              <div className="research-card p-4">
                <div className="layer-chip gold inline-flex">Gold</div>
                <div className="font-serif font-semibold mt-2 text-[var(--ink-strong)]">Semantic</div>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">Beneficiary, payment, integrity, workforce, security, and mission facts and dims.</p>
              </div>
            </div>

            <div className="bg-[var(--paper-deep)] border border-[var(--hairline)] p-5 rounded-sm">
              <div className="eyebrow">Compute engines</div>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">
                Snowflake GovCloud is the primary compute engine. The same Iceberg tables are
                addressable by federated agency readers and by the BFO integrity agent reading
                gold facts for improper-payment detection. One source of truth, many engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Iceberg tables */}
      <section>
        <div className="section-head">
          <h2 className="font-sans text-2xl font-bold text-[var(--ink-strong)]">Iceberg tables — gold tier</h2>
        </div>
        <div className="research-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="fed-thead">
              <tr>
                <th className="text-left px-4 py-2.5">Namespace</th>
                <th className="text-left px-4 py-2.5">Table</th>
                <th className="text-right px-4 py-2.5">Rows</th>
                <th className="text-right px-4 py-2.5">Size</th>
                <th className="text-left px-4 py-2.5">Partition</th>
                <th className="text-left px-4 py-2.5">Last compaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(iceberg?.tables ?? []).map((t) => (
                <tr key={`${t.namespace}.${t.name}`} className="hover:bg-[var(--paper)]">
                  <td className="px-4 py-2.5 ticker text-[11px] text-[var(--ink-soft)]">{t.namespace}</td>
                  <td className="px-4 py-2.5 font-sans font-semibold text-[var(--ink-strong)]">{t.name}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatNumber(t.rows)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-[var(--ink-muted)]">{formatBytes(t.size_bytes)}</td>
                  <td className="px-4 py-2.5 text-[var(--ink-muted)] ticker text-[11px]">{t.partition}</td>
                  <td className="px-4 py-2.5 text-[var(--ink-muted)] ticker text-[11px]">{new Date(t.last_compaction).toISOString().slice(0, 16).replace('T', ' ')}Z</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {iceberg && <p className="mt-3 text-[11px] text-[var(--ink-soft)] ticker">Catalog: {iceberg.catalog}. Boundary: {iceberg.boundary}.</p>}
      </section>

      {/* dbt layers */}
      <section>
        <div className="section-head">
          <h2 className="font-sans text-2xl font-bold text-[var(--ink-strong)]">dbt build layers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(pipeline?.layers ?? []).map((l) => (
            <div key={l.layer} className="research-card p-4">
              <div className="eyebrow">{l.layer}</div>
              <div className="kpi-value mt-1">{formatNumber(l.tables)}</div>
              <div className="text-[12px] text-[var(--ink-muted)] mt-1">{formatNumber(l.rows)} rows</div>
              <div className="text-[12px] text-[var(--ink-muted)]">{formatBytes(l.size_bytes)}</div>
              <div className="text-[11px] text-[var(--ink-soft)] ticker mt-1">Last build {new Date(l.last_built).toISOString().slice(11, 16)}Z</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
