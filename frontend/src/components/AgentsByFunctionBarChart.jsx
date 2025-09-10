import React, { useMemo, useState } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import DashboardCard from '../ui/DashboardCard';
import PaginationControls from '../ui/PaginationControls';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatMiles, formatPct, UnifiedTooltip, axisStyle, gridStyle } from '../ui/chart-utils';

const AgentsByFunctionBarChart = ({ data }) => {
  const { isDarkMode, theme } = useTheme();
  const primary = theme.palette.primary.main;

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
    <DashboardCard icon="query_stats">
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:1.25 }}>
        <WorkOutlineIcon sx={{ color: primary }} />
        <Typography variant="h6" sx={{ fontWeight:600, color:isDarkMode?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.8)' }}>
          Distribución de Agentes por Función - Planta y Contratos
        </Typography>
        <Chip label="Función" size="small" variant="outlined" sx={{ borderColor: primary, color: primary }} />
      </Box>
      <Typography variant="body2" align="center" sx={{ mb:2, color:isDarkMode?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)' }}>
        {chartData.length} funciones • {formatMiles(total)} agentes
      </Typography>
      <Box sx={{ height: Math.max(420, pageData.length * 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pageData} layout="vertical" margin={{ top:16, right:180, bottom:16, left:260 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} {...gridStyle(isDarkMode)} />
            <XAxis type="number" domain={[0, max => Math.ceil((max||0)*1.2)]} allowDecimals={false} tickFormatter={formatMiles} {...axisStyle(isDarkMode)} />
            <YAxis type="category" dataKey="funcion" width={260} tickLine={false} interval={0} {...axisStyle(isDarkMode)} />
            <Tooltip wrapperStyle={{ outline:'none' }} content={({active,payload}) => (
              <UnifiedTooltip active={active} payload={payload} dark={isDarkMode} label={`Función: ${payload?.[0]?.payload?.funcion || 'Sin función'}`}>
                {payload?.length && (<>
                  <div>Cantidad de agentes: {formatMiles(payload[0].payload.cantidad)}</div>
                  <div>Porcentaje: {formatPct((payload[0].payload.cantidad||0)/(total||1))}</div>
                </>)}
              </UnifiedTooltip>
            )} />
            <Bar dataKey="cantidad" maxBarSize={22} fill={primary}>
              <LabelList dataKey="cantidad" content={(p)=><EndOutsideLabel {...p} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {chartData.length > PAGE && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={()=> setPage(p=>Math.max(0,p-1))}
          onNext={()=> setPage(p=>Math.min(totalPages-1,p+1))}
        />
      )}
    </DashboardCard>
  );
};

export default AgentsByFunctionBarChart;
