import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="eyebrow mb-2">404</div>
      <h1 className="font-serif text-3xl text-[var(--ink-strong)]">That section is not in scope</h1>
      <p className="mt-3 text-[var(--ink-muted)]">The page you requested is not part of the BFO ODI reference build.</p>
      <Link to="/" className="mt-6 inline-block status-pill navy">Return to Director's Dashboard</Link>
    </div>
  );
}
