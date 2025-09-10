import React, { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatMiles, formatPct, UnifiedTooltip } from '../ui/chart-utils';

const AGE_BUCKETS = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '65+',
  'No tiene datos',
];
const MIN_RIGHT = 160;
const MAX_RIGHT = 240;
const COLOR = '#00C49F';

const AgeRangeByAreaChart = ({ rows, isDarkMode }) => {
  const [range, setRange] = useState('36-45');
  const { theme } = useTheme();
  const colors = {
    select: {
      text: theme.palette.text.primary,
      focusBorder: theme.palette.primary.main,
      border: theme.palette.divider,
      borderHover: theme.palette.primary.main,
      bg: theme.palette.background.paper,
      icon: theme.palette.text.primary,
      focusShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
      selectedBg: theme.palette.action.selected,
      selectedColor: theme.palette.text.primary,
      selectedHoverBg: theme.palette.action.hover,
    },
  };

  const agregados = useMemo(() => {
    const acc = new Map();
    rows.forEach((r) => {
      if (r.range === range) {
        const dep = r.dependencia || 'Sin dependencia';
        acc.set(dep, (acc.get(dep) || 0) + r.count);
      }
    });
    return Array.from(acc, ([dependencia, cantidad]) => ({ dependencia, cantidad }));
  }, [rows, range]);

  const ordenados = useMemo(() => agregados.sort((a, b) => b.cantidad - a.cantidad), [agregados]);
  const total = useMemo(() => ordenados.reduce((s, d) => s + d.cantidad, 0), [ordenados]);

  const PAGE = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(ordenados.length / PAGE));
  const pageData = useMemo(() => ordenados.slice(page * PAGE, (page + 1) * PAGE), [ordenados, page]);

  React.useEffect(() => setPage(0), [range]);

  const dynamicRight = React.useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map(
      (d) => `${formatMiles(d.cantidad)} (${formatPct((d.cantidad || 0) / (total || 1))})`
    );
    const maxChars = Math.max(...labels.map((t) => t.length));
    const approxWidth = maxChars * 7 + 20;
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, total]);

  const EndOutsideLabel = (props) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
    const label = `${formatMiles(Number(value))} (${formatPct(Number(value) / Number(total || 1))})`;
    const RIGHT_PAD = 8;
    const xText = x + width + RIGHT_PAD;
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
    <Card
      sx={{
        height: '100%',
        background: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderLeft: `6px solid ${COLOR}`,
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <AnalyticsIcon sx={{ color: COLOR }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
              }}
            >
              Distribución por Rangos de Edad según el área - Planta y Contratos
            </Typography>
            <Chip label="Análisis de Edad" size="small" variant="outlined" sx={{ borderColor: COLOR, color: COLOR }} />
          </Box>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 170 }}>
            <InputLabel
              id="range-label"
              sx={{
                color: colors.select.text,
                '&.Mui-focused': {
                  color: colors.select.focusBorder,
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
                    border: isDarkMode
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: isDarkMode
                      ? 'rgba(15,23,42,0.98)'
                      : 'rgba(255,255,255,0.98)',
                    color: colors.select.text,
                    boxShadow: isDarkMode
                      ? '0 8px 24px rgba(0,0,0,0.35)'
                      : '0 8px 24px rgba(0,0,0,0.14)',
                  },
                },
                MenuListProps: {
                  dense: true,
                  sx: { py: 0.5 },
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
                color: colors.select.text,
                backgroundColor: colors.select.bg,
                transition: 'all .2s ease',
                '& .MuiSelect-select': { py: 0.5 },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.select.border,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.select.borderHover,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.select.focusBorder,
                },
                '& .MuiSvgIcon-root': {
                  color: colors.select.icon,
                },
                '&.Mui-focused': {
                  boxShadow: colors.select.focusShadow,
                },
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
                    color: colors.select.text,
                    '&.Mui-selected': {
                      backgroundColor: colors.select.selectedBg,
                      color: colors.select.selectedColor,
                      '&:hover': {
                        backgroundColor: colors.select.selectedHoverBg,
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {range === b && (
                      <CheckRounded fontSize="small" sx={{ color: colors.select.focusBorder }} />
                    )}
                    <span>{b}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography
          variant="body2"
          align="center"
          sx={{
            mb: 2,
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
          }}
        >
          {ordenados.length} categorías • {formatMiles(total)} agentes
        </Typography>
      <Box sx={{ height: 520 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            layout="vertical"
            margin={{ top: 16, right: dynamicRight, bottom: 16, left: 260 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="0 0"
              stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            />
            <XAxis
              type="number"
              domain={[0, (max) => Math.ceil((max || 0) * 1.2)]}
              allowDecimals={false}
              tickFormatter={formatMiles}
              tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
            />
            <YAxis
              type="category"
              dataKey="dependencia"
              width={240}
              tickLine={false}
              interval={0}
              tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: 12 }}
            />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={({ active, payload }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  dark={isDarkMode}
                  label={`Dependencia: ${payload?.[0]?.payload?.dependencia || 'Sin especificar'}`}
                >
                  {payload?.length && (
                    <>
                      <div>Rango de edad: {range}</div>
                      <div>Cantidad de agentes: {formatMiles(payload[0].payload.cantidad)}</div>
                      <div>Porcentaje: {formatPct((payload[0].payload.cantidad || 0) / (total || 1))}</div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey="cantidad" maxBarSize={22} fill={COLOR}>
              <LabelList dataKey="cantidad" content={(props) => <EndOutsideLabel {...props} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {ordenados.length > PAGE && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: COLOR,
                color: COLOR,
                '&:hover': {
                  borderColor: COLOR,
                  backgroundColor: `rgba(0,196,159,0.08)`,
                },
              }}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              « Anterior
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Página {page + 1} de {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: COLOR,
                color: COLOR,
                '&:hover': {
                  borderColor: COLOR,
                  backgroundColor: `rgba(0,196,159,0.08)`,
                },
              }}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Siguiente »
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(AgeRangeByAreaChart);
