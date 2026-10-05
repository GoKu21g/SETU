"use client";

export type DonutSlice = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  size = 148,
  centerLabel = "total",
  legend = true,
}: {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  legend?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const twoCol = data.length > 4;

  // ─── Geometry ─────────────────────────────────────────────────────────────
  // Each segment is a closed SVG path: outer arc → end cap → inner arc → start cap.
  // The caps are exact semicircles (radius = ring thickness / 2) that are tangent to
  // both the outer and inner arcs — giving C¹ smooth junctions everywhere.
  //
  // Min gap for non-overlapping caps at inner arc:
  //   cap_angle = arcsin(capR / innerR) = arcsin(8 / 28) ≈ 16.6°  →  need > 33° per gap.
  // We use 36° so caps never touch even on unequal-value charts.
  const cx = 50;
  const cy = 50;
  const outerR = 43;
  const innerR = 27;
  const capR = (outerR - innerR) / 2; // 8 — semicircular end-cap radius

  // Gap in degrees between consecutive segments
  const gapDeg = data.length > 1 ? 36 : 0;

  // Convert polar → Cartesian (SVG coords: y-axis points DOWN)
  function polar(r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // Build the closed path for one segment [startDeg … endDeg].
  //
  // Path order (all arcs verified to be C¹ smooth at every junction):
  //   M outer-start
  //   A outerR CW → outer-end          (segment outer edge)
  //   A capR   CW → inner-end          (end cap — bulges into gap after endDeg)
  //   A innerR CCW → inner-start       (segment inner edge, reverse direction)
  //   A capR   CW → outer-start        (start cap — bulges into gap before startDeg)
  //   Z
  //
  // sweep-flag=1 → CW on screen (SVG +angle direction, y-axis down)
  // sweep-flag=0 → CCW on screen
  function buildPath(startDeg: number, endDeg: number): string {
    const sweep = endDeg - startDeg;
    if (sweep <= 0) return "";
    const largeArc = sweep > 180 ? 1 : 0;

    const os = polar(outerR, startDeg);
    const oe = polar(outerR, endDeg);
    const ie = polar(innerR, endDeg);
    const is_ = polar(innerR, startDeg);

    const f = (n: number) => n.toFixed(4);

    return [
      `M ${f(os.x)} ${f(os.y)}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${f(oe.x)} ${f(oe.y)}`,
      `A ${capR} ${capR} 0 0 1 ${f(ie.x)} ${f(ie.y)}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${f(is_.x)} ${f(is_.y)}`,
      `A ${capR} ${capR} 0 0 1 ${f(os.x)} ${f(os.y)}`,
      "Z",
    ].join(" ");
  }

  // Lay out segments starting at 12 o'clock (−90°)
  let cumDeg = -90;
  const segments = data.map((d) => {
    const totalDeg = (d.value / total) * 360;
    const startDeg = cumDeg + gapDeg / 2;
    const sweepDeg = Math.max(totalDeg - gapDeg, 2); // floor to 2° so tiny slices show
    const endDeg = startDeg + sweepDeg;
    cumDeg += totalDeg;
    return { ...d, path: buildPath(startDeg, endDeg) };
  });

  return (
    <div
      className={`flex items-center justify-center gap-[var(--space-lg)] py-1 ${
        legend ? "w-full flex-wrap" : "shrink-0"
      }`}
    >
      {/* Chart */}
      <div
        className="relative shrink-0"
        style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          role="img"
          aria-label="Donut chart"
        >
          {segments.map((s) =>
            s.path ? (
              <path key={s.label} d={s.path} fill={s.color} />
            ) : null
          )}
        </svg>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold leading-none text-[var(--text-heading)]">
            {total}
          </span>
          <span className="mt-0.5 text-[0.625rem] text-[var(--text-muted)]">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      {legend && (
        <ul
          className={`grid gap-x-4 gap-y-1.5 ${
            twoCol ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {data.map((d) => (
            <li
              key={d.label}
              className="flex items-center gap-2 text-xs text-[var(--role-text)]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate">{d.label}</span>
              <span className="font-semibold text-[var(--text-secondary)]">
                {d.value}
              </span>
              <span className="text-[0.625rem] text-[var(--text-muted)]">
                ({Math.round((d.value / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
