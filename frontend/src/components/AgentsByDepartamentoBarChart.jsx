import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { formatMiles, formatPct, UnifiedTooltip } from '../ui/chart-utils';

const AgentsByDepartamentoBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(() => {
    const rows = (data || []).map((d) => ({
      departamento: (d.departamento ?? '').toString().trim() || 'Sin especificar',
      cantidad: Number(d.count || 0),
    }));
    return rows.sort((a, b) => b.cantidad - a.cantidad);
  }, [data]);

    const [page, setPage] = useState(0);
    const PAGE = 5;
    const totalPages = Math.ceil((chartData.length || 0) / PAGE) || 1;
    const pageData = useMemo(() => chartData.slice(page * PAGE, (page + 1) * PAGE), [chartData, page]);
    const grandTotal = useMemo(() => chartData.reduce((s, d) => s + (Number(d.cantidad) || 0), 0), [chartData]);

    const MIN_RIGHT = 140;
    const MAX_RIGHT = 240;
    const dynamicRight = React.useMemo(() => {
      if (!pageData?.length) return MIN_RIGHT;
      const labels = pageData.map((d) => `${formatMiles(d.cantidad)} (${formatPct((d.cantidad || 0) / (grandTotal || 1))})`);
      const maxChars = Math.max(...labels.map((t) => t.length));
      const approxWidth = maxChars * 7 + 20;
      return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
    }, [pageData, grandTotal]);

    const EndOutsideLabel = (props) => {
      const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
      const row = pageData?.[index] || {};
      const label = `${formatMiles(row.cantidad || 0)} (${formatPct((row.cantidad || 0) / (grandTotal || 1))})`;
      const color = isDarkMode ? '#ffffff' : '#0f172a';
      return (
        <text x={x + width + 8} y={y + (height || 0) / 2} fontSize={12} textAnchor="start" dominantBaseline="central" fill={color} fontWeight="600" pointerEvents="none">{label}</text>
      );
    };

    return (
      <Card sx={{ height: '100%', background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: isDarkMode ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 12px 40px rgba(0, 0, 0, 0.15)' } }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)', mb: 2 }}>
            Agentes por Departamento - Planta y Contratos
          </Typography>
          <Box sx={{ height: Math.max(320, pageData.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageData} layout="vertical" margin={{ top: 16, right: dynamicRight, bottom: 16, left: 260 }} barCategoryGap={10}>
                <CartesianGrid horizontal={false} strokeDasharray="0 0" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                <XAxis type="number" domain={[0, (max) => Math.ceil((max || 0) * 1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                <YAxis type="category" dataKey="departamento" width={240} tickLine={false} interval={0} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: 12 }} />
                <Tooltip wrapperStyle={{ outline: 'none' }} content={({ active, payload }) => (
                  <UnifiedTooltip active={active} payload={payload} dark={isDarkMode} label={`Departamento: ${payload?.[0]?.payload?.departamento || 'Sin especificar'}`}>
                    {payload?.length && (
                      <>
                        <div>Cantidad de agentes: {formatMiles(payload[0].payload.cantidad)}</div>
                        <div>Porcentaje: {formatPct((payload[0].payload.cantidad || 0) / (grandTotal || 1))}</div>
                      </>
                    )}
                  </UnifiedTooltip>
                )} />
                <Bar dataKey="cantidad" maxBarSize={22} fill={isDarkMode ? '#10b981' : '#059669'}>
                  <LabelList dataKey="cantidad" content={(p) => <EndOutsideLabel {...p} />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {chartData.length > PAGE && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>« Anterior</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>Página {page + 1} de {totalPages}</Typography>
              <Button variant="outlined" size="small" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Siguiente »</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
};

export default AgentsByDepartamentoBarChart;

