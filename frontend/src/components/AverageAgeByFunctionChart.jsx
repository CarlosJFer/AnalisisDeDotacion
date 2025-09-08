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
import {
  AvgAgeLabel,
  UnifiedTooltip,
  ValueLabel,
  formatMiles,
  formatPct,
} from '../ui/chart-utils';

const MARGIN_RIGHT = 120;

const AverageAgeByFunctionChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(
    () =>
      data
        .map((d) => ({
          funcion: (d.function ?? '').toString().trim() || 'Sin función',
          cantidad: Number(d.count || 0),
          promedio: Number(d.avgAge || 0),
          avg: Number(d.avgAge || 0),
        }))
        .sort((a, b) => b.cantidad - a.cantidad),
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
    () => chartData.reduce((sum, d) => sum + d.cantidad, 0),
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
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload }) => (
                  <UnifiedTooltip active={active} payload={payload} label={null}>
                    {payload?.length && (
                      <>
                        <div>Edad promedio: {Math.round(payload[0].payload.avg)} años</div>
                        <div>
                          Cantidad: {formatMiles(payload[0].payload.cantidad)} (
                          {formatPct(payload[0].payload.cantidad / (grandTotal || 1))})
                        </div>
                      </>
                    )}
                  </UnifiedTooltip>
                )}
              />
              <Bar
                dataKey="avg"
                maxBarSize={22}
                fill={isDarkMode ? '#10b981' : '#059669'}
              >
                <LabelList
                  dataKey="avg"
                  content={(props) => <AvgAgeLabel {...props} />}
                />
                <LabelList
                  dataKey="cantidad"
                  content={(props) => <ValueLabel {...props} total={grandTotal} />}
                />
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
