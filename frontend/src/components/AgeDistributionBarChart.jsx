import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { formatMiles, formatPct, UnifiedTooltip } from '../ui/chart-utils';

const COLOR = '#0ea5e9';

const AgeDistributionBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(() => (data || []).map(d => ({ range: d.range, cantidad: Number(d.count || 0) })), [data]);
  const total = useMemo(() => chartData.reduce((s,d)=> s + (d.cantidad||0), 0), [chartData]);

  const EndOutsideLabel = (props) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
    const label = `${formatMiles(Number(value))} (${formatPct(total ? Number(value)/total : 0)})`;
    const color = isDarkMode ? '#ffffff' : '#0f172a';
    return (
      <text x={x + width + 8} y={y + (height||0)/2} fontSize={12} textAnchor="start" dominantBaseline="central" fill={color} fontWeight="600" pointerEvents="none">{label}</text>
    );
  };

  return (
    <Card sx={{ height: '100%', background: isDarkMode ? 'rgba(45,55,72,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderLeft: `6px solid ${COLOR}`, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:1.25 }}>
          <TimelineIcon sx={{ color: COLOR }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}>
            Distribución por Rangos de Edad - Planta y Contratos
          </Typography>
          <Chip label="Rangos de edad" size="small" variant="outlined" sx={{ borderColor: COLOR, color: COLOR }} />
        </Box>
        <Typography variant="body2" align="center" sx={{ mb: 2, color: isDarkMode ? 'rgba(255,255,255,0.7)': 'rgba(0,0,0,0.6)' }}>
          {chartData.length} rangos • {formatMiles(total)} agentes
        </Typography>
        <Box sx={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 160, bottom: 16, left: 40 }}>
              <CartesianGrid horizontal={false} strokeDasharray="0 0" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
              <XAxis dataKey="range" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.3)': 'rgba(0,0,0,0.3)' }} />
              <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.3)': 'rgba(0,0,0,0.3)' }} />
              <Tooltip wrapperStyle={{ outline:'none' }} content={({active,payload,label}) => (
                <UnifiedTooltip active={active} payload={payload} dark={isDarkMode} label={`Rango: ${label}`}>
                  {payload?.length && (
                    <>
                      <div>Cantidad de agentes: {formatMiles(payload[0].value)}</div>
                      <div>Porcentaje: {formatPct(total ? payload[0].value/total: 0)}</div>
                    </>
                  )}
                </UnifiedTooltip>
              )} />
              <Bar dataKey="cantidad" fill={COLOR} maxBarSize={28}>
                <LabelList dataKey="cantidad" content={(p)=><EndOutsideLabel {...p} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AgeDistributionBarChart;

