import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { formatMiles, formatPct, UnifiedTooltip } from '../ui/chart-utils';

const COLOR = '#ec4899';

const AgentsByFunctionBarChart = ({ data, isDarkMode }) => {
  const chartData = useMemo(() => (data || [])
    .map(d => ({ funcion: (d.function ?? '').toString().trim() || 'Sin función', cantidad: Number(d.count || 0) }))
    .sort((a,b)=> b.cantidad - a.cantidad)
  , [data]);

  const [page, setPage] = useState(0);
  const PAGE = 10;
  const totalPages = Math.ceil(chartData.length / PAGE) || 1;
  const pageData = useMemo(()=> chartData.slice(page*PAGE, (page+1)*PAGE), [chartData, page]);
  const total = useMemo(()=> chartData.reduce((s,d)=> s + (d.cantidad||0), 0), [chartData]);

  const EndOutsideLabel = (props) => {
    const { x=0, y=0, width=0, height=0, index=0 } = props;
    const v = Number(pageData?.[index]?.cantidad) || 0;
    const label = `${formatMiles(v)} (${formatPct(total ? v/total : 0)})`;
    const color = isDarkMode ? '#ffffff' : '#0f172a';
    return <text x={x+width+8} y={y+(height||0)/2} fontSize={12} textAnchor="start" dominantBaseline="central" fill={color} fontWeight="600" pointerEvents="none">{label}</text>;
  };

  return (
    <Card sx={{ height:'100%', background:isDarkMode?'rgba(45,55,72,0.8)':'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', border:isDarkMode?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)', borderLeft:`6px solid ${COLOR}`, borderRadius:3 }}>
      <CardContent sx={{ p:3 }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:1.25 }}>
          <WorkOutlineIcon sx={{ color: COLOR }} />
          <Typography variant="h6" sx={{ fontWeight:600, color:isDarkMode?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.8)' }}>
            Distribución de Agentes por Función - Planta y Contratos
          </Typography>
          <Chip label="Función" size="small" variant="outlined" sx={{ borderColor: COLOR, color: COLOR }} />
        </Box>
        <Typography variant="body2" align="center" sx={{ mb:2, color:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)' }}>
          {chartData.length} funciones • {formatMiles(total)} agentes
        </Typography>
        <Box sx={{ height: Math.max(420, pageData.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pageData} layout="vertical" margin={{ top:16, right:180, bottom:16, left:260 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} strokeDasharray="0 0" stroke={isDarkMode ? 'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'} />
              <XAxis type="number" domain={[0, max => Math.ceil((max||0)*1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.7)' }} />
              <YAxis type="category" dataKey="funcion" width={260} tickLine={false} interval={0} tick={{ fontSize:12, fill: isDarkMode? 'rgba(255,255,255,0.7)': 'rgba(0,0,0,0.7)' }} />
              <Tooltip wrapperStyle={{ outline:'none' }} content={({active,payload}) => (
                <UnifiedTooltip active={active} payload={payload} dark={isDarkMode} label={`Función: ${payload?.[0]?.payload?.funcion || 'Sin función'}`}>
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
        {chartData.length > PAGE && (
          <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1, mt:2 }}>
            <Button variant="outlined" size="small" sx={{ borderColor: COLOR, color: COLOR, '&:hover':{ borderColor: COLOR, backgroundColor:'rgba(236,72,153,0.08)'} }} onClick={()=> setPage(p=>Math.max(0,p-1))} disabled={page===0}>« Anterior</Button>
            <Typography variant="body2" sx={{ alignSelf:'center' }}>Página {page+1} de {totalPages}</Typography>
            <Button variant="outlined" size="small" sx={{ borderColor: COLOR, color: COLOR, '&:hover':{ borderColor: COLOR, backgroundColor:'rgba(236,72,153,0.08)'} }} onClick={()=> setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}>Siguiente »</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentsByFunctionBarChart;

