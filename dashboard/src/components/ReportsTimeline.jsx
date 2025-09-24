import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

// Simple, dependency-free responsive line chart for daily counts
// Props: data: Array<{ date: string (YYYY-MM-DD), count: number }>
const ReportsTimeline = ({ data = [], height = 260 }) => {
  const { path, points, yTicks, maxY } = useMemo(() => {
    const w = 800; // logical width for viewBox; SVG will scale
    const h = height - 40; // leave room for axes/labels
    const paddingLeft = 40;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 28;

    const innerW = w - paddingLeft - paddingRight;
    const innerH = h - paddingTop - paddingBottom;

    const n = data.length || 1;
    const maxY = Math.max(1, ...data.map(d => d.count));

    const xFor = (i) => paddingLeft + (i * innerW) / Math.max(1, n - 1);
    const yFor = (v) => paddingTop + innerH - (v / maxY) * innerH;

    const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d.count), d }));
    const path = pts.length
      ? `M ${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
      : '';

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
      const v = Math.round(maxY * ratio);
      return { y: yFor(v), v };
    });

    return { path, points: pts, yTicks, maxY };
  }, [data, height]);

  const firstLabel = data[0]?.date || '';
  const midLabel = data[Math.floor(data.length / 2)]?.date || '';
  const lastLabel = data[data.length - 1]?.date || '';

  return (
    <Box sx={{ width: '100%' }}>
      <svg viewBox={`0 0 800 ${height}`} width="100%" height={height} role="img" aria-label="Reports timeline">
        {/* Background */}
        <rect x="0" y="0" width="800" height={height} fill="#ffffff" />

        {/* Y grid and ticks */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line x1="40" x2="788" y1={t.y} y2={t.y} stroke="#e9ecef" strokeWidth="1" />
            <text x="36" y={t.y + 4} textAnchor="end" fontSize="10" fill="#6c757d">{t.v}</text>
          </g>
        ))}

        {/* X labels (first, mid, last) */}
        <text x="40" y={height - 8} textAnchor="start" fontSize="10" fill="#6c757d">{firstLabel}</text>
        <text x="400" y={height - 8} textAnchor="middle" fontSize="10" fill="#6c757d">{midLabel}</text>
        <text x="788" y={height - 8} textAnchor="end" fontSize="10" fill="#6c757d">{lastLabel}</text>

        {/* Area under curve (soft fill) */}
        {points.length > 1 && (
          <path
            d={`${path} L 788,${points[points.length - 1].y} L 788,${height - 28} L 40,${height - 28} Z`}
            fill="#0d6efd22"
            stroke="none"
          />
        )}

        {/* Line */}
        <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2" />

        {/* Points with native tooltips */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#0d6efd" />
            <title>{`${p.d.date}: ${p.d.count} reports`}</title>
          </g>
        ))}
      </svg>
      <Typography variant="caption" color="text.secondary">
        Daily report counts (max {maxY})
      </Typography>
    </Box>
  );
};

export default ReportsTimeline;
