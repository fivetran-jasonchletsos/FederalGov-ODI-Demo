/* Lightweight US-state heatmap. Each state is a labeled square block in a
 * roughly geographic grid. Avoids shipping topojson; keeps the bundle small
 * and the visual federal-formal rather than playful. */

type Datum = { state: string; value: number };

const STATE_GRID: { code: string; row: number; col: number }[] = [
  { code: 'AK', row: 0, col: 0 },                                  { code: 'ME', row: 0, col: 10 },
  { code: 'VT', row: 1, col: 9 }, { code: 'NH', row: 1, col: 10 },
  { code: 'WA', row: 1, col: 1 }, { code: 'ID', row: 1, col: 2 }, { code: 'MT', row: 1, col: 3 }, { code: 'ND', row: 1, col: 4 }, { code: 'MN', row: 1, col: 5 }, { code: 'WI', row: 1, col: 6 }, { code: 'MI', row: 1, col: 7 }, { code: 'NY', row: 1, col: 8 },
  { code: 'OR', row: 2, col: 1 }, { code: 'NV', row: 2, col: 2 }, { code: 'WY', row: 2, col: 3 }, { code: 'SD', row: 2, col: 4 }, { code: 'IA', row: 2, col: 5 }, { code: 'IL', row: 2, col: 6 }, { code: 'IN', row: 2, col: 7 }, { code: 'OH', row: 2, col: 8 }, { code: 'PA', row: 2, col: 9 }, { code: 'NJ', row: 2, col: 10 }, { code: 'CT', row: 2, col: 11 }, { code: 'RI', row: 2, col: 12 },
  { code: 'CA', row: 3, col: 1 }, { code: 'UT', row: 3, col: 2 }, { code: 'CO', row: 3, col: 3 }, { code: 'NE', row: 3, col: 4 }, { code: 'MO', row: 3, col: 5 }, { code: 'KY', row: 3, col: 6 }, { code: 'WV', row: 3, col: 7 }, { code: 'VA', row: 3, col: 8 }, { code: 'MD', row: 3, col: 9 }, { code: 'DE', row: 3, col: 10 },
  { code: 'AZ', row: 4, col: 2 }, { code: 'NM', row: 4, col: 3 }, { code: 'KS', row: 4, col: 4 }, { code: 'AR', row: 4, col: 5 }, { code: 'TN', row: 4, col: 6 }, { code: 'NC', row: 4, col: 7 }, { code: 'SC', row: 4, col: 8 }, { code: 'DC', row: 4, col: 9 },
  { code: 'HI', row: 5, col: 0 }, { code: 'TX', row: 5, col: 3 }, { code: 'OK', row: 5, col: 4 }, { code: 'LA', row: 5, col: 5 }, { code: 'MS', row: 5, col: 6 }, { code: 'AL', row: 5, col: 7 }, { code: 'GA', row: 5, col: 8 },
  { code: 'FL', row: 6, col: 8 },
];

export function UsHeatmap({ data, valueLabel }: { data: Datum[]; valueLabel: string }) {
  const lookup = new Map(data.map((d) => [d.state, d.value]));
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);

  function color(state: string): { fill: string; text: string } {
    if (!lookup.has(state)) return { fill: '#e7e3d6', text: '#6b7280' };
    const v = lookup.get(state)!;
    const t = (v - min) / (max - min || 1);
    // Interpolate ivory -> federal navy
    const r = Math.round(250 + (26 - 250) * t);
    const g = Math.round(249 + (54 - 249) * t);
    const b = Math.round(246 + (93 - 246) * t);
    return { fill: `rgb(${r},${g},${b})`, text: t > 0.55 ? '#ffffff' : '#1a365d' };
  }

  const cell = 44;
  const gap = 4;
  const cols = 13;
  const rows = 7;
  const width = cols * (cell + gap);
  const height = rows * (cell + gap);

  return (
    <div className="research-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="eyebrow">{valueLabel}</div>
          <h3 className="font-serif text-lg text-[var(--ink-strong)]">Beneficiary distribution, 50 states + DC</h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-soft)]">
          <span>Lower</span>
          <div className="h-2 w-32 rounded-sm" style={{ background: 'linear-gradient(90deg, rgb(250,249,246), rgb(26,54,93))' }} />
          <span>Higher</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {STATE_GRID.map(({ code, row, col }) => {
          const { fill, text } = color(code);
          const x = col * (cell + gap);
          const y = row * (cell + gap);
          const v = lookup.get(code);
          return (
            <g key={code}>
              <rect x={x} y={y} width={cell} height={cell} fill={fill} stroke="#ffffff" strokeWidth={1} rx={2}>
                <title>{`${code}: ${v !== undefined ? new Intl.NumberFormat('en-US').format(v) : 'no data'}`}</title>
              </rect>
              <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={text} fontFamily='"JetBrains Mono", monospace'>{code}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
