import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// Canonical three-cluster nav, mirrors Clarity / Verity / Altavest:
//   1. Persona links (Home + agency pages, flat)
//   2. dbt-Wizard ▾ — narrative dropdown (Scenario / Live / Outcome)
//   3. ODI ▾ — plumbing dropdown (Architecture / Pipeline / About)
//
// Federal routes for the wizard are nested under /dbt-wizard/* (no overview
// page yet), so the dropdown matches what the router actually serves.
type NavEntry =
  | { kind: 'link'; to: string; label: string }
  | { kind: 'group'; label: string; rootTo: string; matchPrefixes: string[]; children: { to: string; label: string }[] };

const NAV: NavEntry[] = [
  { kind: 'link', to: '/',                  label: 'Home' },
  { kind: 'link', to: '/mission',           label: 'Mission Performance' },
  { kind: 'link', to: '/improper-payments', label: 'Improper Payments' },
  { kind: 'link', to: '/security',          label: 'FISMA & Security' },
  { kind: 'link', to: '/policy',            label: 'Policy Brief' },
  {
    kind: 'group',
    label: 'dbt-Wizard',
    rootTo: '/dbt-wizard/scenario',
    matchPrefixes: ['/dbt-wizard'],
    children: [
      { to: '/dbt-wizard/scenario', label: 'Scenario' },
      { to: '/dbt-wizard/live',     label: 'Live build' },
      { to: '/dbt-wizard/outcome',  label: 'Outcome' },
    ],
  },
  {
    kind: 'group',
    label: 'ODI',
    rootTo: '/architecture',
    matchPrefixes: ['/architecture', '/pipeline', '/about'],
    children: [
      { to: '/architecture', label: 'Architecture' },
      { to: '/pipeline',     label: 'Pipeline' },
      { to: '/about',        label: 'About' },
    ],
  },
];

// Flattened version for the mobile grid (dropdown groups become rows of links).
const NAV_FLAT: { to: string; label: string }[] = NAV.flatMap((e) =>
  e.kind === 'link' ? [{ to: e.to, label: e.label }] : e.children,
);

// ─── NavEntryEl — dark-theme variant, lifted from Altavest ──────────────────
function NavEntryEl({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (entry.kind === 'link') {
    return (
      <NavLink
        to={entry.to}
        end={entry.to === '/'}
        className={({ isActive }) =>
          `relative px-2.5 py-2 font-medium tracking-tight transition-colors text-[13px] whitespace-nowrap ${
            isActive ? 'text-[var(--amber-bright)]' : 'text-white/80 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {entry.label}
            {isActive && (
              <span className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px]" style={{ background: 'var(--amber)' }} />
            )}
          </>
        )}
      </NavLink>
    );
  }

  const isActive = entry.matchPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative px-2.5 py-2 font-medium tracking-tight transition-colors text-[13px] whitespace-nowrap inline-flex items-center gap-1 ${
          isActive ? 'text-[var(--amber-bright)]' : 'text-white/80 hover:text-white'
        }`}
      >
        {entry.label}
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isActive && (
          <span className="absolute left-2.5 right-5 -bottom-[1px] h-[2px]" style={{ background: 'var(--amber)' }} />
        )}
      </button>
      {open && (
        <span role="menu" className="absolute left-0 top-full mt-1 min-w-[200px] rounded-sm border border-white/15 bg-[var(--navy-deep)] shadow-xl overflow-hidden z-50">
          {entry.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.to === '/'}
              className={({ isActive: ia }) =>
                `block px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  ia
                    ? 'bg-white/10 text-[var(--amber-bright)]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </span>
      )}
    </span>
  );
}

const DEMOS = [
  { key: 'tax-assessment', name: 'Allegheny County Tax', industry: 'Public sector, local assessment', url: 'https://fivetran-jasonchletsos.github.io/tax-assessment-databricks-demo/', accent: '#dc2626' },
  { key: 'healthcare',     name: 'Epic Clarity',         industry: 'Healthcare, clinical analytics',     url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'finserv',        name: 'Altavest Capital',     industry: 'Financial services, wealth and banking', url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/', accent: '#1d4ed8' },
  { key: 'insurance',      name: 'Atlas Risk',           industry: 'Insurance, policies and claims', url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/', accent: '#0369a1' },
  { key: 'media',          name: 'Lighthouse Media',     industry: 'Media, audience intelligence',       url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/', accent: '#7c3aed' },
  { key: 'retail',         name: 'Storefront Analytics', industry: 'Retail and e-commerce',              url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/', accent: '#ea580c' },
  { key: 'techsaas',       name: 'SaaS Pulse',           industry: 'Tech, SaaS analytics',               url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/', accent: '#059669' },
  { key: 'supplychain',    name: 'Manifest',             industry: 'Supply chain, logistics',            url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/', accent: '#0891b2' },
  { key: 'lifesci',        name: 'Cohort',               industry: 'Life sciences, clinical research',   url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/', accent: '#be185d' },
  { key: 'federal',        name: 'Bureau of Federal Outcomes', industry: 'Federal civilian, benefits and mission', url: 'https://fivetran-jasonchletsos.github.io/FederalGov-ODI-Demo/', accent: '#1a365d' },
];
const CURRENT_DEMO = 'federal';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="federal-rail" />

      <header className="bg-[var(--navy-deep)] text-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0">
              <div className="h-10 w-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--red)' }}>
                <BFOMark className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-serif font-semibold text-lg sm:text-xl tracking-tight truncate">
                  Bureau of Federal Outcomes
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--amber-bright)]">
                  Office of the Chief Data Officer
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV.map((entry) => (
                <NavEntryEl key={entry.kind === 'link' ? entry.to : entry.label} entry={entry} pathname={location.pathname} />
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-sm text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 pt-3 space-y-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV_FLAT.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-sm text-center font-medium border ${
                        isActive ? 'bg-[var(--amber)] text-[var(--navy-deep)] border-[var(--amber)]' : 'border-white/15 text-white/80 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--navy-deep)] text-white/80 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-sm flex items-center justify-center" style={{ background: 'var(--red)' }}>
                <BFOMark className="h-4 w-4 text-white" />
              </div>
              <div className="font-serif font-semibold text-white">Bureau of Federal Outcomes</div>
            </div>
            <p className="leading-relaxed text-white/60">
              Reference build of the Open Data Infrastructure pattern for a federal civilian agency.
              All data is synthetic; BFO is a fictional agency.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Authorization Boundary</div>
            <p className="leading-relaxed text-white/70">
              FedRAMP High. Snowflake GovCloud, Apache Iceberg in BFO-controlled S3 (GovCloud),
              Fivetran connectors operating within the BFO ATO.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Open Standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg v2. Snowflake Polaris catalog. dbt semantic layer.
              Any compute engine, no vendor lock-in.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© 2026 BFO ODI Reference Build, Fivetran Open Data Infrastructure</div>
            <div className="flex items-center gap-3">
              <span>Synthetic data, demonstration only</span>
              <a
                href={`${import.meta.env.BASE_URL?.replace(/\/$/, '')}/BFO-3min-Demo-Runbook.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors"
                style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}
              >
                3-min Runbook
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 10L10 2M5 2h5v5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border bg-[var(--amber)]/20 text-[var(--amber-bright)] border-[var(--amber)]/40 hover:bg-[var(--amber)]/30"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-bright)] animate-pulse" />
        Snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-[300px] rounded-sm border border-[var(--hairline)] bg-white shadow-xl z-40 overflow-hidden">
          <div className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 border-b border-[var(--hairline)]">Switch demo</div>
          <div className="py-1 max-h-[420px] overflow-y-auto">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">Current</span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>{inner}</a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BFOMark({ className = '' }: { className?: string }) {
  // Stylized federal mark: capitol-dome silhouette over horizontal bars.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 18h16" />
      <path d="M5 18v-3h14v3" />
      <path d="M12 3v3" />
      <path d="M8 15c0-3 1.8-5 4-5s4 2 4 5" />
      <circle cx="12" cy="4.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
