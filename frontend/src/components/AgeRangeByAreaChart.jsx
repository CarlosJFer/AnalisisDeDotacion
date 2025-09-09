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
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { formatMiles, formatPct } from '../ui/chart-utils';

const AGE_BUCKETS = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '65+',
  'No tiene datos',
];
// Margen derecho dinámico para alojar etiquetas fuera de la barra
const MIN_RIGHT = 160;
const MAX_RIGHT = 240;

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

  // Calcula un margen derecho dinámico en función del texto de las etiquetas
  const dynamicRight = React.useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map(d => `${formatMiles(d.cantidad)} (${formatPct((d.cantidad||0) / (total || 1))})`);
    const maxChars = Math.max(...labels.map(t => t.length));
    const approxWidth = maxChars * 7 + 20; // 7px por carácter + padding
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, total]);

  // Etiqueta personalizada: afuera a la derecha, anclada al final de la barra
  const EndOutsideLabel = (props) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
    const label = `${formatMiles(Number(value))} (${formatPct(Number(value) / Number(total || 1))})`;
    const RIGHT_PAD = 8;
    const xText = x + width + RIGHT_PAD; // justo después del final de la barra
    const yText = y + (height || 0) / 2;
    const color = isDarkMode ? '#ffffff' : '#0f172a';
    return (
      <text
        x={xText}
        y={yText}
        fontSize={12}
        textAnchor="start"
        dominantBaseline="central"
        fill={color}
        fontWeight="600"
        pointerEvents="none"
      >
        {label}
      </text>
    );
  };

  return (
    <Card sx={{background:isDarkMode?'rgba(45,55,72,0.8)':'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',border:isDarkMode?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)',borderRadius:3}}>
      <CardContent sx={{p:3}}>
        {/** Las etiquetas de valores se dibujan al final de cada barra */}
        <Box className="flex items-center justify-between gap-3" sx={{mb:2}}>
          <Typography variant="h6" sx={{fontWeight:600,color:isDarkMode?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.8)'}}>
            Distribución por Rangos de Edad según el área - Planta y Contratos
          </Typography>
          {/* Selector con estilo moderno */}
          <FormControl
            size="small"
            variant="outlined"
            sx={{ minWidth: 170, mt: 1 }}
          >
            <InputLabel
              id="range-label"
              sx={{
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                '&.Mui-focused': {
                  color: isDarkMode ? '#86efac' : '#059669',
                },
              }}
            >
              Rango de edad
            </InputLabel>
            <Select
              labelId="range-label"
              id="range-select"
              value={range}
              label="Rango de edad"
              onChange={(e) => setRange(e.target.value)}
              IconComponent={KeyboardArrowDownRounded}
              MenuProps={{
                PaperProps: {
                  elevation: 0,
                  sx: {
                    mt: 0.5,
                    borderRadius: 2,
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: isDarkMode ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                    boxShadow: isDarkMode
                      ? '0 8px 24px rgba(0,0,0,0.35)'
                      : '0 8px 24px rgba(0,0,0,0.14)'
                  },
                },
                MenuListProps: {
                  dense: true,
                  sx: { py: 0.5 }
                },
                disableScrollLock: true,
                keepMounted: true,
                TransitionProps: { timeout: 120 },
              }}
              sx={{
                borderRadius: 9999,
                pr: 4,
                px: 1.5,
                height: 36,
                color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                transition: 'all .2s ease',
                '& .MuiSelect-select': { py: 0.5 },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#86efac' : '#059669',
                },
                '& .MuiSvgIcon-root': {
                  color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)'
                },
                '&.Mui-focused': {
                  boxShadow: isDarkMode
                    ? '0 0 0 3px rgba(134,239,172,0.25)'
                    : '0 0 0 3px rgba(5,150,105,0.15)'
                }
              }}
            >
              {AGE_BUCKETS.map((b) => (
                <MenuItem
                  key={b}
                  value={b}
                  dense
                  disableRipple
                  sx={{
                    mx: 0.75,
                    my: 0.25,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
                    '&.Mui-selected': {
                      backgroundColor: isDarkMode ? 'rgba(16,185,129,0.18)' : 'rgba(5,150,105,0.12)',
                      color: isDarkMode ? '#eafff5' : '#064e3b',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(16,185,129,0.22)' : 'rgba(5,150,105,0.16)'
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {range === b && (
                      <CheckRounded fontSize="small" sx={{ color: isDarkMode ? '#86efac' : '#059669' }} />
                    )}
                    <span>{b}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 520 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pageData} layout="vertical" margin={{ top: 16, right: dynamicRight, bottom: 16, left: 260 }} barCategoryGap={10}>
              <CartesianGrid
                horizontal={false}
                strokeDasharray="0 0"
                stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              />
              <XAxis type="number" domain={[0, (max)=>Math.ceil(max*1.2)]} allowDecimals={false} tickFormatter={formatMiles} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
              <YAxis type="category" dataKey="dependencia" width={260} tickLine={false} interval={0} tick={{ fontSize:12, fill: isDarkMode? 'rgba(255,255,255,0.7)': 'rgba(0,0,0,0.7)' }} tickFormatter={(v)=> v.length>32? v.slice(0,32)+'…':v} />
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const bg = isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)';
                  const bd = isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)';
                  const fg = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
                  const shadow = isDarkMode
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.15)';
                  return (
                    <div
                      style={{
                        backgroundColor: bg,
                        border: bd,
                        color: fg,
                        borderRadius: 8,
                        padding: '10px 12px',
                        boxShadow: shadow,
                        minWidth: 220,
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        Rango de edad: {range}
                      </div>
                      <div>Cantidad de agentes: {formatMiles(payload[0].value)}</div>
                      <div>Porcentaje: {formatPct(payload[0].value / (total || 1))}</div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="cantidad"
                maxBarSize={22}
                fill="#00C49F"
              >
                <LabelList
                  dataKey="cantidad"
                  content={(props) => <EndOutsideLabel {...props} />}
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

export default React.memo(AgeRangeByAreaChart);
