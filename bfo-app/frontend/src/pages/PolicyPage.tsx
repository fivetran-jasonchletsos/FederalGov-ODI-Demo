export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header>
        <div className="eyebrow mb-1">Policy Brief</div>
        <h1 className="font-serif text-3xl text-[var(--ink-strong)]">Why federal agency data is fragmented, and how ODI bridges it under FedRAMP</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          A short brief for the Chief Data Officer and Chief Information Security Officer. No
          marketing, no fluff. Numbers, verbs, and an architectural recommendation.
        </p>
      </header>

      <section className="research-card p-6 space-y-3">
        <h2 className="font-serif text-xl text-[var(--ink-strong)]">The fragmentation problem, in three sentences</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          Federal civilian agencies inherit decades of mainframe systems-of-record (Cobol benefits
          engines, claims engines, ledger engines) wrapped in successive generations of middleware.
          Modernization waves added SaaS perimeters around the same operational data (ServiceNow for
          case management, Salesforce Public Sector Cloud for outreach, Workday for the workforce),
          each one with its own permission model and its own copy of the citizen. Cross-agency
          mission stovepipes then required programs to negotiate data-sharing memoranda one feed at
          a time, with each feed re-creating a copy of the same beneficiary in a new authorization
          boundary.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="research-card p-5">
          <div className="eyebrow">Where this leaves the CDO</div>
          <ul className="mt-2 text-sm text-[var(--ink-muted)] space-y-2 leading-relaxed">
            <li>Five or more authoritative copies of the same beneficiary, one per system-of-record.</li>
            <li>Reconciliation runs nightly, mission analytics see yesterday's truth.</li>
            <li>Improper-payment detection requires assembling a join across systems the CDO does not own.</li>
            <li>Every new dashboard re-ingests the same data into yet another silo.</li>
          </ul>
        </div>
        <div className="research-card p-5">
          <div className="eyebrow">Where this leaves the CISO</div>
          <ul className="mt-2 text-sm text-[var(--ink-muted)] space-y-2 leading-relaxed">
            <li>The ATO surface area is the union of all those silos, not one perimeter.</li>
            <li>Continuous-monitoring telemetry lives in a different system from the data it protects.</li>
            <li>Identity reviews are run vendor-by-vendor, with no agency-level pivot.</li>
            <li>Audit-log immutability is a per-tool feature, not an agency property.</li>
          </ul>
        </div>
      </section>

      <section className="research-card p-6 space-y-3" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--navy)' }}>
        <h2 className="font-serif text-xl text-[var(--ink-strong)]">What ODI changes</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          Open Data Infrastructure consolidates the authoritative copy. Fivetran connectors operate
          inside the agency's FedRAMP authorization boundary and land Apache Iceberg directly into
          an agency-controlled S3 bucket in GovCloud. Snowflake Polaris catalogs the tables. dbt
          builds the semantic layer. Snowflake GovCloud, federated agency readers, and the
          agency's own integrity agents all read the same gold tables.
        </p>
        <ul className="text-sm text-[var(--ink)] space-y-2 leading-relaxed">
          <li><strong>One authorization boundary.</strong> The data and the engines that read it are inside the same FedRAMP perimeter, not five vendor perimeters.</li>
          <li><strong>One copy of the citizen.</strong> dbt produces a governed beneficiary dimension once. Every downstream workload reads it.</li>
          <li><strong>Audit-log immutability is a table property.</strong> Iceberg time-travel plus S3 Object Lock satisfies retention without a separate archive vendor.</li>
          <li><strong>Cross-agency sharing without re-ingest.</strong> Federated readers query the same Iceberg files. No second copy means no second authorization boundary to defend.</li>
          <li><strong>Agents read what humans read.</strong> The integrity agent's "synthetic-identity at intake" detection joins the same payment ledger fact that the CDO's denial-rate dashboard reads.</li>
        </ul>
      </section>

      <section className="research-card p-6">
        <h2 className="font-serif text-xl text-[var(--ink-strong)]">Recommendation</h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
          Treat the lakehouse as the agency's authoritative copy. Move every system-of-record into
          Iceberg via Fivetran connectors that run inside the agency ATO. Retire downstream
          reconciliation jobs as the silver layer absorbs the join logic. Hold all downstream
          analytics, agents, and federated agency readers to the rule that they read the same gold
          tables; no engine gets its own copy. The CISO's continuous-monitoring view and the CDO's
          mission-performance view then live in the same governed lakehouse, with the same identity
          model and the same audit-log table.
        </p>
      </section>
    </div>
  );
}
