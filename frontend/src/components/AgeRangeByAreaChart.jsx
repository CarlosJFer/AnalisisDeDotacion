import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
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

const AGE_BUCKETS = ['18-25','26-35','36-45','46-55','56-65','65+','No tiene datos'];
const nf = new Intl.NumberFormat('es-AR');
const formatMiles = (n) => nf.format(n);
const formatPct = (p, d=1) => `${(p*100).toFixed(d).replace('.', ',')}%`;
const RIGHT_PAD = 8;
const MARGIN_RIGHT = 96;
const useIsDark = () => document.documentElement.classList.contains('dark');

const ValueLabel = (p) => {
  const { x=0, y=0, width=0, value=0, viewBox, total } = p;
  const chartW = viewBox?.width ?? 0;
  const text = `${formatMiles(value)} (${formatPct(value/total)})`;
  const approx = text.length * 7;
  const barEnd = x + width;
  const chartRight = chartW - MARGIN_RIGHT;
  const willOverflow = barEnd + RIGHT_PAD + approx > chartRight;
  const textX = willOverflow ? barEnd - 6 : barEnd + RIGHT_PAD;
  const anchor = willOverflow ? 'end' : 'start';
  const fill = willOverflow ? '#0f172a' : (useIsDark()? '#fff' : '#0f172a');
  return (
    <text x={textX} y={y} dy={4} fontSize={12} textAnchor={anchor} fill={fill} pointerEvents="none">
      {text}
    </text>
  );
};

const Tip = ({ active, payload, label, total, range }) => {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value || 0);
  const dark = useIsDark();
  const bg = dark ? '#0b1220' : '#ffffff';
  const fg = dark ? '#e2e8f0' : '#0f172a';
  const bd = dark ? '#334155' : '#cbd5e1';
  return (
    <div style={{background:bg,color:fg,border:`1px solid ${bd}`,borderRadius:10,padding:'10px 12px',boxShadow:'0 4px 16px rgba(0,0,0,.25)',minWidth:240}}>
      <div style={{fontWeight:600,marginBottom:6}}>{label}</div>
      <div>Rango de edad: <strong>{range}</strong></div>
      <div>Cantidad de agentes: <strong>{formatMiles(v)}</strong></div>
      <div>Porcentaje: <strong>{formatPct(v/total)}</strong></div>
    </div>
  );
};

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
          <select value={range} onChange={e=>setRange(e.target.value)} className="px-3 py-1 rounded-lg border border-slate-500/50 bg-transparent" title="Seleccionar rango de edad">
            {AGE_BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Box>
        <Box sx={{ height: 520 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pageData} layout="vertical" margin={{ top: 16, right: MARGIN_RIGHT, bottom: 16, left: 260 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} strokeDasharray="0 0" />
              <XAxis type="number" domain={[0, (max)=>Math.ceil(max*1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
              <YAxis type="category" dataKey="dependencia" width={260} tickLine={false} interval={0} tick={{ fontSize:12, fill: isDarkMode? 'rgba(255,255,255,0.7)': 'rgba(0,0,0,0.7)' }} tickFormatter={(v)=> v.length>32? v.slice(0,32)+'…':v} />
              <Tooltip content={<Tip total={total} range={range} />} wrapperStyle={{ outline: 'none' }} />
              <Bar dataKey="cantidad" maxBarSize={22} fill="#00C49F">
                <LabelList content={(p)=><ValueLabel {...p} total={total} />} />
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
