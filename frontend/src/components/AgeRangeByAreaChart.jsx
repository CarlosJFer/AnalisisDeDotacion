import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from 'recharts';
import { ValueLabel, UnifiedTooltip, formatMiles, formatPct } from '../ui/chart-utils';

const AGE_BUCKETS = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '65+',
  'No tiene datos',
];
const MARGIN_RIGHT = 120;

const AgeRangeByAreaChart = ({ rows, isDarkMode }) => {
  const [range, setRange] = useState('36-45');

  const agregados = useMemo(() => {
    const acc = new Map();
    rows.forEach(r => {
      if (r.range === range) {
        const dep = r.dependencia || 'Sin dependencia';
        acc.set(dep, (acc.get(dep) || 0) + r.count);
      }
    });
    return Array.from(acc, ([dependencia, cantidad]) => ({ dependencia, cantidad }));
  }, [rows, range]);

  const ordenados = useMemo(() => agregados.sort((a,b)=>b.cantidad-a.cantidad), [agregados]);
  const total = useMemo(() => ordenados.reduce((s,d)=>s+d.cantidad,0), [ordenados]);

  const PAGE = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(ordenados.length / PAGE));
  const pageData = useMemo(() => ordenados.slice(page*PAGE, (page+1)*PAGE), [ordenados,page]);

  React.useEffect(()=>setPage(0),[range]);

  return (
    <Card sx={{background:isDarkMode?'rgba(45,55,72,0.8)':'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',border:isDarkMode?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)',borderRadius:3}}>
      <CardContent sx={{p:3}}>
        <Box className="flex items-center justify-between gap-3" sx={{mb:2}}>
          <Typography variant="h6" sx={{fontWeight:600,color:isDarkMode?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.8)'}}>
            Distribución por Rangos de Edad según el área - Planta y Contratos
          </Typography>
          {/* Replace basic <select> with Material UI Select for modern styling */}
          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? '#4ade80' : '#059669',
              },
              '& .MuiSvgIcon-root': {
                color: isDarkMode
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(0,0,0,0.6)',
              },
            }}
          >
            <InputLabel id="range-label">Rango de edad</InputLabel>
            <Select
              labelId="range-label"
              id="range-select"
              value={range}
              label="Rango de edad"
              onChange={(e) => setRange(e.target.value)}
            >
              {AGE_BUCKETS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 520 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pageData} layout="vertical" margin={{ top: 16, right: MARGIN_RIGHT, bottom: 16, left: 260 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} strokeDasharray="0 0" />
              <XAxis type="number" domain={[0, (max)=>Math.ceil(max*1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
              <YAxis type="category" dataKey="dependencia" width={260} tickLine={false} interval={0} tick={{ fontSize:12, fill: isDarkMode? 'rgba(255,255,255,0.7)': 'rgba(0,0,0,0.7)' }} tickFormatter={(v)=> v.length>32? v.slice(0,32)+'…':v} />
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload }) => (
                  <UnifiedTooltip active={active} payload={payload} label={null}>
                    {payload?.length && (
                      <>
                        <div>Rango de edad: {range}</div>
                        <div>Cantidad de agentes: {formatMiles(payload[0].value)}</div>
                        <div>Porcentaje: {formatPct(payload[0].value / (total || 1))}</div>
                      </>
                    )}
                  </UnifiedTooltip>
                )}
              />
              <Bar
                dataKey="cantidad"
                maxBarSize={22}
                fill={isDarkMode ? '#0ea5e9' : '#06b6d4'}
              >
                <LabelList
                  dataKey="cantidad"
                  content={(props) => <ValueLabel {...props} total={total} />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        {ordenados.length > PAGE && (
          <Box sx={{display:'flex',justifyContent:'flex-end',gap:1,mt:2}}>
            <Button variant="outlined" size="small" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>← Anterior</Button>
            <Typography variant="body2" sx={{alignSelf:'center'}}>
              Página {page+1} de {totalPages}
            </Typography>
            <Button variant="outlined" size="small" onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}>Siguiente →</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AgeRangeByAreaChart;
