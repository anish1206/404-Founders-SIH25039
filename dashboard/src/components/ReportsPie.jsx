import React, { useMemo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

const defaultPalette = [
  '#0d6efd', '#6f42c1', '#198754', '#fd7e14', '#dc3545', '#20c997', '#6610f2', '#0dcaf0', '#ffc107', '#6c757d'
];

function polarToCartesian(cx, cy, r, angleInDeg) {
  const angleInRad = ((angleInDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRad),
    y: cy + r * Math.sin(angleInRad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'L', cx, cy,
    'Z',
  ].join(' ');
}

// Props: data: Array<{ label: string, value: number, color?: string }>
const ReportsPie = ({ data = [], height = 260, donut = false }) => {
  const { total, slices, legend } = useMemo(() => {
    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    let cursor = 0;
    const slices = data.map((d, i) => {
      const value = Math.max(0, d.value || 0);
      const angle = total > 0 ? (value / total) * 360 : 0;
      const start = cursor;
      const end = cursor + angle;
      cursor = end;
      const color = d.color || defaultPalette[i % defaultPalette.length];
      return { ...d, start, end, color };
    });
    const legend = slices.map((s) => ({
      label: s.label,
      value: s.value,
      color: s.color,
      pct: total > 0 ? Math.round((s.value / total) * 100) : 0,
    }));
    return { total, slices, legend };
  }, [data]);

  const w = 800; // viewBox width
  const h = height; // viewBox height
  const cx = 140;
  const cy = height / 2;
  const r = Math.min(cx, cy) - 8;
  const innerR = donut ? r * 0.55 : 0;

  if (!total) {
    return (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <Typography variant="body2" color="text.secondary">No data to display</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} role="img" aria-label="Reports by type">
        {/* Pie on left side */}
        <g>
          {slices.map((s, i) => (
            <path key={i} d={describeArc(cx, cy, r, s.start, s.end)} fill={s.color} stroke="#fff" strokeWidth="1" />
          ))}
          {donut && (
            <circle cx={cx} cy={cy} r={innerR} fill="#fff" />
          )}
          {donut && (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#343a40">
              {total}
            </text>
          )}
        </g>

        {/* Legend on right side */}
        <g>
          {legend.map((l, idx) => (
            <g key={idx} transform={`translate(${cx + r + 32}, ${cy - legend.length * 14 + idx * 24})`}>
              <rect width="12" height="12" fill={l.color} rx="2" />
              <text x="18" y="10" fontSize="12" fill="#343a40">
                {l.label} ({l.value}) — {l.pct}%
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Box>
  );
};

export default ReportsPie;
