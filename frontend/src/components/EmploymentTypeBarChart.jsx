import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { formatMiles, formatPct, UnifiedTooltip } from '../ui/chart-utils';

const COLOR = '#eab308';

const EmploymentTypeBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(() => (data || []).map(d => ({ tipo: (d.type ?? '').toString().trim() || 'Sin especificar', cantidad: Number(d.count || 0) })), [data]);
  const total = useMemo(()=> chartData.reduce((s,d)=> s + (d.cantidad||0), 0), [chartData]);

  const EndOutsideLabel = (props) => {
    const { x=0, y=0, width=0, height=0, value=0 } = props;
    const label = `${formatMiles(Number(value))} (${formatPct(total ? Number(value)/total : 0)})`;
    const color = isDarkMode ? '#ffffff' : '#0f172a';
    return <text x={x+width+8} y={y+(height||0)/2} fontSize={12} textAnchor="start" dominantBaseline="central" fill={color} fontWeight="600" pointerEvents="none">{label}</text>;
  };

  return (
    <Card sx={{ height:'100%', background: isDarkMode ? 'rgba(45,55,72,0.8)' : 'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderLeft:`6px solid ${COLOR}`, borderRadius:3 }}>
      <CardContent sx={{ p:3 }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:1.25 }}>
          <AssignmentTurnedInIcon sx={{ color: COLOR }} />
          <Typography variant="h6" sx={{ fontWeight:600, color:isDarkMode?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.8)' }}>
            Agentes por Situación de Revista - Planta y Contratos
          </Typography>
          <Chip label="Situación" size="small" variant="outlined" sx={{ borderColor: COLOR, color: COLOR }} />
        </Box>
        <Typography variant="body2" align="center" sx={{ mb:2, color:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)' }}>
          {chartData.length} categorías • {formatMiles(total)} agentes
        </Typography>
        <Box sx={{ height: Math.max(320, chartData.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top:16, right:160, bottom:16, left:240 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} strokeDasharray="0 0" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
              <XAxis type="number" domain={[0, max => Math.ceil((max||0)*1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.7)' }} />
              <YAxis type="category" dataKey="tipo" width={240} tickLine={false} interval={0} tick={{ fontSize:12, fill:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.7)' }} />
              <Tooltip wrapperStyle={{ outline:'none' }} content={({active,payload}) => (
                <UnifiedTooltip active={active} payload={payload} dark={isDarkMode} label={`Situación: ${payload?.[0]?.payload?.tipo || 'Sin especificar'}`}>
                  {payload?.length && (<>
                    <div>Cantidad de agentes: {formatMiles(payload[0].payload.cantidad)}</div>
                    <div>Porcentaje: {formatPct((payload[0].payload.cantidad||0)/(total||1))}</div>
                  </>)}
                </UnifiedTooltip>
              )} />
              <Bar dataKey="cantidad" maxBarSize={22} fill={COLOR}>
                <LabelList dataKey="cantidad" content={(p)=><EndOutsideLabel {...p} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmploymentTypeBarChart;

