# FederalGov-ODI-Demo — Bureau of Federal Outcomes (BFO)

ODI reference demo for a fictional federal civilian agency. Persona: a CDO and CISO who share one governed lakehouse inside a single FedRAMP High authorization boundary. Fivetran connectors land source data into Apache Iceberg on agency-controlled S3 in GovCloud; dbt builds bronze through gold; Snowflake GovCloud serves queries; the integrity agent reads the same gold tables the CDO's dashboard reads.

- Live: https://fivetran-jasonchletsos.github.io/FederalGov-ODI-Demo/
- App code: `bfo-app/frontend/`
- Deploy workflow: `.github/workflows/deploy.yml`

All data is synthetic. BFO is a fictional agency. No real federal data is depicted.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Source systems (inside BFO FedRAMP High ATO)             │
│                                                           │
│  BENS Mainframe (Cobol)  ─── Fivetran HVR (CDC)           │
│  Benefits Eligibility (SQL Server) ── Fivetran HVR (CDC)  │
│  Case Management (Oracle) ───── Fivetran HVR (CDC)        │
│  ServiceNow ────────────────── Fivetran SaaS connector    │
│  Salesforce Public Sector Cloud  ── Fivetran SaaS         │
│  Workday HCM ───────────────── Fivetran SaaS connector    │
│  GSA SAM.gov vendor feed ──── Fivetran Connector SDK      │
│  Treasury IPP ──────────────── Fivetran Connector SDK     │
│  CISA threat-intel feed ─────  Fivetran Connector SDK     │
│  USPS NCOA address feed ───── Fivetran Connector SDK      │
└───────────────────┬──────────────────────────────────────┘
                    │  Fivetran Managed Data Lake Service (MDLS)
                    │  writes Apache Iceberg directly into
                    │  bfo-odi-lake-gov (S3 GovCloud)
                    ▼
┌──────────────────────────────────────────────────────────┐
│  Apache Iceberg v2 on S3 (GovCloud)                       │
│  Catalog: Snowflake Polaris (BFO GovCloud)                │
│  Boundary: FedRAMP High — bfo-odi-lake-gov                │
│                                                           │
│  Bronze (raw, 142 tables, ~17 TB)                         │
│  Silver (conformed, 88 tables, ~3.9 TB)                   │
│  Gold   (semantic, 42 tables, ~455 GB)                    │
│  Marts  (mission, 24 tables, ~104 GB)                     │
└───────────────────┬──────────────────────────────────────┘
                    │  dbt labs (bronze→silver→silver→gold)
                    │  Snowflake GovCloud reads Iceberg in place
                    │  via External Volume + Polaris catalog
                    ▼
┌──────────────────────────────────────────────────────────┐
│  Snowflake GovCloud (primary compute)                     │
│  Athena, DuckDB, Trino, Spark (federated agency readers)  │
│  BFO integrity agent (reads gold facts directly)          │
└──────────────────────────────────────────────────────────┘
                    │
                    ▼
  React + Vite SPA (GitHub Pages) — reads pre-built JSON snapshots
```

Fivetran does not write to Snowflake-managed storage here. It writes Iceberg files directly into a BFO-controlled S3 GovCloud bucket. Snowflake GovCloud reads those files in place via an External Volume registered against the Snowflake Polaris catalog. No engine holds a private copy of the data.

---

## Source connectors

All ten connectors run inside the BFO authorization boundary. The table below matches `pipeline.json`.

| Source | Connector type | Fivetran ID |
|---|---|---|
| Benefits Eligibility (SQL Server) | Fivetran HVR — CDC | incidentally_tangent |
| Case Management (Oracle) | Fivetran HVR — CDC | entreaty_historical |
| BENS Mainframe (Cobol benefits engine) | Fivetran HVR — CDC | fax_refinement |
| ServiceNow (case management) | Fivetran SaaS connector | caliber_narrowness |
| Salesforce Public Sector Cloud | Fivetran SaaS connector | estuary_ture |
| Workday HCM (federal workforce) | Fivetran SaaS connector | silver_betrothed |
| GSA SAM.gov vendor feed | Fivetran Connector SDK | perpetuate_fluid |
| Treasury IPP improper-payment feed | Fivetran Connector SDK | grain_neural |
| CISA threat-intelligence feed | Fivetran Connector SDK | inquiries_mortified |
| USPS NCOA address feed | Fivetran Connector SDK | lifter_beaches |

---

## dbt layers

The dbt project runs 154 models and 488 tests across four layers. Layer counts are from `pipeline.json`.

### Bronze (raw — 142 tables, ~17 TB)

Source-shaped Iceberg tables. Append-only, time-travel retained for audit. One schema per source:

- `bronze_bens.*` — application records, decision events, payment ledger from the Cobol benefits engine
- `bronze_benefits_eligibility.*` — eligibility decisions and case records from SQL Server via HVR
- `bronze_case_mgmt.*` — case lifecycle, SLA performance, appeal outcomes from Oracle via HVR
- `bronze_servicenow.*` — tickets, SLA data, assignment history
- `bronze_salesforce_psc.*` — beneficiary master, program enrollments, contact events
- `bronze_workday.*` — position master, training, certifications
- `bronze_gsa_sam.*` — vendor eligibility, exclusion-list deltas
- `bronze_treasury_ipp.*` — improper-payment signals, cross-agency match results
- `bronze_cisa.*` — threat indicators, advisory bulletins
- `bronze_usps_ncoa.*` — address-of-record deltas, mail-deliverability signals

### Silver (conformed — 88 tables, ~3.9 TB)

dbt models normalize keys across BENS, Workday, Salesforce PSC, ServiceNow, and external feeds. The conformed beneficiary dimension resolves the same citizen across all source systems.

### Gold (semantic — 42 tables, ~455 GB)

Iceberg tables that all downstream engines and agents read. The following eight tables are registered in the Snowflake Polaris catalog (from `iceberg.json`):

| Namespace | Table | Rows | Partition |
|---|---|---|---|
| gold.benefits | fact_application_decision | 41.2 M | decision_date_month |
| gold.benefits | fact_payment_ledger | 88.4 M | payment_date_month |
| gold.benefits | dim_beneficiary | 9.2 M | state_code |
| gold.integrity | fact_improper_payment_flag | 2.4 M | flag_date_month |
| gold.integrity | dim_scheme_taxonomy | 42 | none |
| gold.workforce | fact_training_outcome | 1.8 M | cohort_quarter |
| gold.security | fact_continuous_monitoring | 14.2 M | assessment_date |
| gold.mission | fact_appropriation_execution | 28 K | fiscal_quarter |

### Marts (mission — 24 tables, ~104 GB)

Aggregated output models used by the Director's Dashboard KPI tiles, the mission-performance views, and the congressional reporting pack.

---

## App pages

The SPA lives under `bfo-app/frontend/src/pages/` and uses React Router with a `HashRouter`. All routes are nested under the shared `Layout` component.

| Route | Component | What it shows |
|---|---|---|
| `/` | HomePage | Director's Dashboard. KPI tiles (9.2 M beneficiaries, $52.4 B YTD outlays, 21.4 d average decision time, FISMA status). US beneficiary heatmap by state. Three CDO desk signals: improper-payments spike, FISMA continuous-monitoring alert, workforce ROI trend. dbt-wizard entry point. |
| `/architecture` | ArchitecturePage | ODI reference diagram (AliveMedallion component). Source systems, Iceberg layer cylinders with live row/size counts from `pipeline.json` and `iceberg.json`, multi-engine consumer list. Gold Iceberg table catalog. dbt build-layer summary. |
| `/pipeline` | PipelinePage | Connector table with status, Fivetran ID, rows/hr, lag, and deep-link to Fivetran dashboard. Layer size/row counts. Last-24-hour dbt run log with model count, duration, and test pass/fail. Interactive connector failure simulator. |
| `/improper-payments` | ImproperPaymentsPage | Program integrity view. YTD flagged/recovered/avoided totals and case count. Top scheme rankings by flagged amount, recovered amount, and QoQ trend. Integrity agent queue: recommended holds pending Treasury IPP secondary validation, with case count and potential recovery per batch. |
| `/mission` | MissionPage | OMB-style agency mission performance. Strategic goals vs targets with performance-pct and trend. Appropriation execution bar chart by account. Workforce 180-day employment trend line chart. Workforce-program outcome table (enrolled, certified, employed, median wage gain, ROI). Congressional reports due next 90 days. |
| `/security` | SecurityPage | FISMA continuous-monitoring view. ATO status, impact level, issue date, expiry, and system boundary. POA&M open/high/critical counts. Vulnerability severity table with MTTR and SLA compliance. Patch compliance progress bars for endpoints and servers. DLP alert counts by category. IAM quarterly access recertification summary. Audit-log retention parameters. |
| `/policy` | PolicyPage | CDO/CISO policy brief on federal data fragmentation and how ODI bridges it. Not a marketing page — lists specific pain points and architectural recommendations. |
| `/about` | AboutPage | ODI story block, BFO agency description, three-pillar architecture summary, full tech-stack list, eight data-source descriptions, ODI vs MDS comparison. |
| `/dbt-wizard/scenario` | DbtWizardScenarioPage | Scenario framing: CIO asks why tier-3 recovery slipped 18% YoY. No `gold.fct_recovery_by_office_tier_program_quarter` model exists. OIG briefing in 18 hours. Manual ETA: 3-5 days. Shows upstream models, state-of-world panel, and 6-step build path. |
| `/dbt-wizard/live` | DbtWizardLivePage | Live-build playback. Dark terminal surface. Four sub-agents (Explorer, Summary, Worker, Verification) narrate character-by-character while the SQL model and YAML schema contract are typed into side panels. Step rail shows Discovery, Schema Understanding, Data Inspection, Model Creation, Test Authoring, Materialization. Playback controls: play/pause, 1x/2x/4x speed, restart. |
| `/dbt-wizard/outcome` | DbtWizardOutcomePage | Build complete summary: model code, row count (312), column tests, combination tests, and lineage panel. |

---

## Data files

Pre-built JSON snapshots live under `bfo-app/frontend/public/data/` and are loaded by the app's `api/queries` module:

- `summary.json` — agency KPI tiles (beneficiaries, outlays, applications, decision time, FISMA status, open vulnerabilities)
- `pipeline.json` — connector list, layer stats, dbt run history
- `iceberg.json` — gold-tier Iceberg table catalog (namespace, name, rows, size, partition, last compaction)
- `beneficiaries.json` — state-level beneficiary geography and problem-program list
- `fraud_improper.json` — scheme rankings, agent queue
- `mission_performance.json` — strategic goals, appropriation execution
- `workforce.json` — workforce-program outcomes and 180-day employment trend
- `security.json` — FISMA posture, POA&M, vulnerabilities, patch compliance, DLP, IAM reviews
- `scenario.json` — dbt-wizard scenario parameters
- `build_script.json` — dbt-wizard build playback events
- `agents.json` — sub-agent definitions for the live-build page
- `outcome.json` — build complete summary
- `programs.json` — benefit program metadata
- `iceberg.json` — Iceberg table catalog

---

## Running locally

### Frontend

```bash
cd bfo-app/frontend
npm ci
npm run dev      # http://localhost:5173
```

The dev server reads all data from `public/data/*.json`. No AWS credentials, no Fivetran account, no Snowflake connection needed. The full site is browsable against the committed synthetic snapshot.

```bash
npm run build    # tsc + vite build -> dist/
npm run preview  # serve dist/ locally
```

### Tech stack

- React 19, React Router 7 (HashRouter for GitHub Pages compatibility)
- Vite 7, TypeScript 5.6
- Tailwind CSS 3
- Recharts 3 (mission/workforce trend charts)

---

## What this demo illustrates for SEs

1. FedRAMP boundary containment: all ten connectors and all dbt compute run inside one authorization boundary. Data does not leave the agency perimeter.

2. Agency-owned storage: Fivetran writes Iceberg directly into `bfo-odi-lake-gov` (S3 GovCloud). Snowflake GovCloud reads the files in place via External Volume; it does not own the storage layer.

3. Multi-engine open format: Snowflake GovCloud, Athena, DuckDB, Trino, and Spark all query the same Iceberg files. The app's Architecture page shows all five engines.

4. One source of truth for CDO and CISO: the Director's Dashboard KPI tiles, the improper-payments integrity agent, and the FISMA continuous-monitoring view all read the same gold layer.

5. dbt-wizard on-demand model authoring: the scenario shows a net-new gold model authored by four sub-agents in 90 seconds when a manual build would take 3-5 days.

---

## Disclaimer

All data is synthetic. The Bureau of Federal Outcomes is a fictional federal civilian agency. Program names, beneficiary counts, scheme descriptions, and security postures are constructed for architectural demonstration only. Nothing on this site represents a real federal agency, a real program, a real beneficiary, or a real ATO.
