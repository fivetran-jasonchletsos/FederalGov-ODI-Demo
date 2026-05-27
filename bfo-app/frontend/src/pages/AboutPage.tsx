export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Canonical ODI story block — copied verbatim, federal cap on the disclaimer. */}
      <section className="research-card p-6 mb-10" style={{ borderColor: 'var(--amber)' }}>
        <div className="eyebrow mb-2" style={{ color: 'var(--amber-dim)' }}>The ODI Story</div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: 'var(--amber-dim)' }}
        >
          Read the full ODI Story &rarr;
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">ODI Reference Architecture</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">About the Bureau of Federal Outcomes</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The Bureau of Federal Outcomes (BFO) is a fictional federal civilian agency that
          administers means-tested benefits, healthcare access, and workforce-development programs
          for 9.2 million citizen beneficiaries. This reference build shows how a single CDO and a
          single CISO can run an agency from one governed lakehouse, with Fivetran connectors landing
          data inside the FedRAMP authorization boundary, dbt building the semantic layer, and
          Snowflake GovCloud serving queries against Apache Iceberg tables in a BFO-controlled
          GovCloud S3 bucket.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="research-card p-5">
              <div className="layer-chip gold inline-flex mb-3">{p.tag}</div>
              <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Tech stack</h2>
        <div className="research-card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-serif font-semibold text-[var(--ink-strong)]">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Data sources</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((s) => (
            <article key={s.title} className="research-card p-5">
              <div className="flex items-start gap-3">
                <span className="layer-chip bronze shrink-0">Source</span>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{s.description}</p>
                  <div className="mt-2 text-xs text-[var(--ink-soft)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Provides:</span> {s.provides}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">ODI vs MDS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="research-card p-5">
            <div className="eyebrow mb-2">Traditional MDS</div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Warehouse-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>Single proprietary warehouse owns storage and compute.</li>
              <li>Cross-agency sharing requires expensive replication.</li>
              <li>Engine choice locked to vendor roadmap.</li>
              <li>Agency pays for storage twice, lake plus warehouse.</li>
              <li>Schema evolution is vendor-managed.</li>
            </ul>
          </div>
          <div className="research-card p-5" style={{ borderColor: 'var(--amber)' }}>
            <div className="eyebrow mb-2" style={{ color: 'var(--amber-dim)' }}>Open Data Infrastructure</div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">Open lake-centric, FedRAMP-aligned</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              <li>Agency owns the storage layer, BFO-controlled S3 in GovCloud.</li>
              <li>Any compute engine, Snowflake GovCloud, Trino, Spark, federated readers.</li>
              <li>Catalog is open, Snowflake Polaris on Iceberg.</li>
              <li>Authorization boundary is one perimeter, not many vendor perimeters.</li>
              <li>Schema evolution is in the Iceberg spec, vendor-neutral.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-sm bg-[var(--paper-deep)] border border-[var(--hairline)] p-5 text-sm">
        <div className="eyebrow mb-2" style={{ color: 'var(--red-dim)' }}>Disclaimer</div>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">All data is synthetic.</strong>{' '}
          The Bureau of Federal Outcomes is a fictional federal civilian agency. Program names,
          beneficiary counts, scheme descriptions, and security postures are constructed for
          architectural demonstration. Nothing on this site represents a real federal agency, a
          real program, a real beneficiary, or a real ATO.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  { tag: 'Pillar 1', title: 'Agency-owned storage in GovCloud', body: 'Fivetran writes into BFO-controlled S3 in GovCloud as Apache Iceberg tables. The authorization boundary is the agency, not the vendor.' },
  { tag: 'Pillar 2', title: 'Open table format under FISMA', body: 'Iceberg v2 provides ACID, schema evolution, and time-travel queries that satisfy audit-log immutability requirements for FISMA continuous monitoring.' },
  { tag: 'Pillar 3', title: 'Any compute, one source of truth', body: 'Snowflake GovCloud reads the same gold tables that downstream integrity agents and federated agency readers use. No re-ingest, no second copy.' },
];

const STACK = [
  { layer: 'Ingest',     name: 'Fivetran HVR + Connector SDK', note: 'BENS Mainframe CDC, ServiceNow, Salesforce PSC, Workday HCM, GSA SAM.gov, Treasury IPP, CISA, USPS NCOA.' },
  { layer: 'Storage',    name: 'Amazon S3 (GovCloud)',         note: 'bfo-odi-lake-gov bucket holds bronze, silver, gold prefixes inside the FedRAMP High boundary.' },
  { layer: 'Format',     name: 'Apache Iceberg v2',            note: 'Parquet with ZSTD, partition evolution, time travel for audit-log retention.' },
  { layer: 'Catalog',    name: 'Snowflake Polaris',            note: 'Iceberg REST catalog with row- and column-level access control mapped to BFO IAM.' },
  { layer: 'Transform',  name: 'dbt on Snowflake GovCloud',    note: '154 models, 488 tests, four layered marts.' },
  { layer: 'Query',      name: 'Snowflake GovCloud',           note: 'Serverless, Iceberg-aware, federated to other authorized agency readers.' },
  { layer: 'Frontend',   name: 'React 19 + Vite + Tailwind',   note: 'Static SPA on GitHub Pages, reads the gold layer via Snowflake / Athena / Trino.' },
  { layer: 'Charts',     name: 'Recharts',                     note: 'Composable charts for mission and workforce trends.' },
];

const DATA_SOURCES = [
  { title: 'BENS Mainframe', description: 'The agency\'s legacy Cobol-era benefits engine. Change data capture via Fivetran HVR feeds applications, decisions, and the payment ledger into bronze.', provides: 'Application records, decision events, payment ledger.' },
  { title: 'ServiceNow case management', description: 'Citizen-facing case work and appeals routing. Connector lands tickets, SLAs, and assignment history into bronze.', provides: 'Case lifecycle, SLA performance, appeal outcomes.' },
  { title: 'Salesforce Public Sector Cloud', description: 'Beneficiary outreach and program enrollment. Connector lands account, contact, and program-enrollment changes.', provides: 'Beneficiary master, program enrollments, contact events.' },
  { title: 'Workday HCM', description: 'Federal civilian workforce records. Connector lands position, training, and certification events.', provides: 'Position master, training, certifications.' },
  { title: 'GSA SAM.gov', description: 'Vendor and provider eligibility data. Custom Connector SDK feed lands daily exclusion-list deltas.', provides: 'Vendor eligibility, exclusion-list deltas.' },
  { title: 'Treasury IPP', description: 'Treasury\'s Improper Payments program data. Custom connector lands cross-agency improper-payment signals.', provides: 'Improper-payment signals, cross-agency match results.' },
  { title: 'CISA threat-intel feed', description: 'CISA cyber-threat indicators. Custom connector lands indicators-of-compromise tied to federal civilian systems.', provides: 'Threat indicators, advisory bulletins.' },
  { title: 'USPS NCOA', description: 'National Change of Address. Custom connector lands citizen address-of-record deltas for fraud detection and beneficiary reachability.', provides: 'Address-of-record deltas, mail-deliverability signals.' },
];
