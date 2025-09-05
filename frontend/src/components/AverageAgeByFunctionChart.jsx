import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const nf = new Intl.NumberFormat('es-AR');
const formatMiles = (n) => nf.format(n);
const formatPct = (p, d = 1) => `${(p * 100).toFixed(d).replace('.', ',')}%`;
const RIGHT_PAD = 8;
const MARGIN_RIGHT = 96;
const useIsDark = () =>
  document.documentElement.classList.contains('dark');

const AgeAvgLabel = (props) => {
  const { x = 0, y = 0, width = 0, viewBox, avg } = props;
  const chartW = viewBox?.width ?? 0;
  const text = `Edad promedio: ${Math.round(avg)} años`;
  const approx = text.length * 7;
  const xText = Math.min(x + width + RIGHT_PAD, chartW - approx - 4);
  const fill = useIsDark() ? '#ffffff' : '#0f172a';
  return (
    <text
      x={xText}
      y={y}
      dy={4}
      fontSize={12}
      textAnchor="start"
      fill={fill}
      pointerEvents="none"
    >
      {text}
    </text>
  );
};

const Tip = ({ active, payload, label, grandTotal }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload || {};
  const cant = item.count || 0;
  const avg = Math.round(item.avgAge || 0);
  const dark = useIsDark();
  const bg = dark ? '#0b1220' : '#ffffff';
  const fg = dark ? '#e2e8f0' : '#0f172a';
  const bd = dark ? '#334155' : '#cbd5e1';
  return (
    <div
      style={{
        background: bg,
        color: fg,
        border: `1px solid ${bd}`,
        borderRadius: 10,
        padding: '10px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        minWidth: 220,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div>Edad promedio: <strong>{avg} años</strong></div>
      <div>Cantidad: <strong>{formatMiles(cant)}</strong> ({formatPct(cant / grandTotal)})</div>
    </div>
  );
};

const AverageAgeByFunctionChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(
    () =>
      data
        .map((d) => ({
          funcion: (d.function ?? '').toString().trim() || 'Sin función',
          count: d.count || 0,
          avgAge: d.avgAge || 0,
        }))
        .sort((a, b) => b.count - a.count),
    [data]
  );

  const [page, setPage] = useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE);
  const pageData = useMemo(
    () => chartData.slice(page * PAGE, (page + 1) * PAGE),
    [chartData, page]
  );
  const grandTotal = useMemo(
    () => chartData.reduce((sum, d) => sum + d.count, 0),
    [chartData]
  );

  return (
    <Card
      sx={{
        height: '100%',
        background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDarkMode
            ? '0 12px 40px rgba(0, 0, 0, 0.4)'
            : '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 600,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            mb: 2,
          }}
        >
          Edad Promedio por Función - Planta y Contratos
        </Typography>
        <Box sx={{ height: Math.max(420, pageData.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pageData}
              layout="vertical"
              margin={{ top: 16, right: MARGIN_RIGHT, bottom: 16, left: 260 }}
              barCategoryGap={10}
            >
              <CartesianGrid horizontal={false} strokeDasharray="0 0" />
              <XAxis
                type="number"
                domain={[0, (max) => Math.ceil(max * 1.2)]}
                allowDecimals={false}
                tickFormatter={formatMiles}
                tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
              />
              <YAxis
                type="category"
                dataKey="funcion"
                width={240}
                tickLine={false}
                interval={0}
                tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: 12 }}
              />
              <Tooltip content={<Tip grandTotal={grandTotal} />} wrapperStyle={{ outline: 'none' }} />
              <Bar dataKey="count" maxBarSize={22} fill="#00C49F">
                <LabelList content={(p) => <AgeAvgLabel {...p} avg={p.payload.avgAge} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        {chartData.length > PAGE && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Anterior
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Página {page + 1} de {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Siguiente →
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AverageAgeByFunctionChart;
