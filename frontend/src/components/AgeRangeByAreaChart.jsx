import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  formatMiles,
  formatPct,
  UnifiedTooltip,
  rechartsCommon,
  ValueLabel,
  getSeriesColor,
} from "../ui/chart-utils.jsx";
import { DashboardCard, PaginationControls, modeVars } from "../ui";
import icons from "../ui/icons.js";

const AGE_BUCKETS = [
  "18-25",
  "26-35",
  "36-45",
  "46-55",
  "56-65",
  "65+",
  "No tiene datos",
];
const MIN_RIGHT = 160;
const MAX_RIGHT = 240;

const AgeRangeByAreaChart = ({ rows, isDarkMode }) => {
  const [range, setRange] = useState("36-45");
  const { theme } = useTheme();
  const COLOR = useMemo(() => getSeriesColor("age-range-by-area", isDarkMode), [isDarkMode]);
  const vars = modeVars(isDarkMode);

  const rangeOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.range));
    return AGE_BUCKETS.filter((b) => set.has(b));
  }, [rows]);

  React.useEffect(() => {
    if (!rangeOptions.includes(range)) {
      setRange(rangeOptions[0] || "");
    }
  }, [rangeOptions, range]);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (
        rows.length > 1000 &&
        typeof window !== "undefined" &&
        "requestIdleCallback" in window
      ) {
        requestIdleCallback(() => setRange(value));
      } else {
        setRange(value);
      }
    },
    [rows.length],
  );

  const agregados = useMemo(() => {
    const acc = new Map();
    rows.forEach((r) => {
      if (r.range === range) {
        const dep = r.dependencia || "Sin dependencia";
        acc.set(dep, (acc.get(dep) || 0) + r.count);
      }
    });
    return Array.from(acc, ([dependencia, cantidad]) => ({
      dependencia,
      cantidad,
    }));
  }, [rows, range]);

  const ordenados = useMemo(
    () => agregados.slice().sort((a, b) => b.cantidad - a.cantidad),
    [agregados],
  );
  const total = useMemo(
    () => ordenados.reduce((s, d) => s + d.cantidad, 0),
    [ordenados],
  );

  const PAGE = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(ordenados.length / PAGE));
  const pageData = useMemo(
    () => ordenados.slice(page * PAGE, (page + 1) * PAGE),
    [ordenados, page],
  );

  React.useEffect(() => setPage(0), [range]);

  const dynamicRight = useMemo(() => {
    if (!pageData?.length) return MIN_RIGHT;
    const labels = pageData.map((d) =>
      formatPct((d.cantidad || 0) / (total || 1)),
    );
    const maxChars = Math.max(...labels.map((t) => t.length));
    const approxWidth = maxChars * 7 + 20;
    return Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, approxWidth));
  }, [pageData, total]);
  const handlePrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const handleNext = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  const { axisProps, gridProps, tooltipProps } = rechartsCommon(isDarkMode);

  return (
    <DashboardCard
      title="Distribución por Rangos de Edad según el área - Planta y Contratos"
      icon={<icons.distribucion />}
      isDarkMode={isDarkMode}
      headerRight={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label="Análisis de Edad"
            size="small"
            variant="outlined"
            sx={{ borderColor: COLOR, color: COLOR }}
          />
          <FormControl size="small" variant="outlined" sx={{ minWidth: 170 }}>
            <InputLabel
              id="range-label"
              sx={{
                color: theme.palette.text.primary,
                "&.Mui-focused": { color: theme.palette.primary.main },
              }}
            >
              Rango de edad
            </InputLabel>
            <Select
              labelId="range-label"
              id="range-select"
              value={range}
              label="Rango de edad"
              onChange={handleChange}
              IconComponent={icons.flechaAbajo}
              MenuProps={{
                PaperProps: {
                  elevation: 0,
                  sx: {
                    mt: 0.5,
                    borderRadius: 2,
                    border: isDarkMode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: isDarkMode
                      ? "rgba(15,23,42,0.98)"
                      : "rgba(255,255,255,0.98)",
                    color: "var(--text-color)",
                    boxShadow: isDarkMode
                      ? "0 8px 24px rgba(0,0,0,0.35)"
                      : "0 8px 24px rgba(0,0,0,0.14)",
                  },
                },
                MenuListProps: { dense: true, sx: { py: 0.5 } },
                disableScrollLock: true,
                keepMounted: true,
                TransitionProps: { timeout: 120 },
              }}
              sx={{
                ...vars,
                borderRadius: 9999,
                pr: 4,
                px: 1.5,
                height: 36,
                color: "var(--text-color)",
                backgroundColor: "var(--bg-color)",
                transition: "all .2s ease",
                "& .MuiSelect-select": { py: 0.5 },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "& .MuiSvgIcon-root": {
                  color: "var(--text-color)",
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
                },
              }}
            >
              {rangeOptions.map((b) => (
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
                    color: "var(--text-color)",
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.action.selected,
                      color: "var(--text-color)",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {range === b && (
                      <icons.check
                        fontSize="small"
                        sx={{ color: theme.palette.primary.main }}
                      />
                    )}
                    <span>{b}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      }
    >
      <Typography
        variant="body2"
        align="center"
        sx={{
          mb: 2,
          color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
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
              {...gridProps}
              horizontal={false}
              strokeDasharray="0 0"
            />
            <XAxis
              {...axisProps}
              type="number"
              domain={[0, (max) => Math.ceil((max || 0) * 1.2)]}
              allowDecimals={false}
              tickFormatter={formatMiles}
            />
            <YAxis
              {...axisProps}
              type="category"
              dataKey="dependencia"
              width={240}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              {...tooltipProps}
              content={({ active, payload }) => (
                <UnifiedTooltip
                  active={active}
                  payload={payload}
                  dark={isDarkMode}
                  label={`Dependencia: ${payload?.[0]?.payload?.dependencia || "Sin especificar"}`}
                >
                  {payload?.length && (
                    <>
                      <div>Rango de edad: {range}</div>
                      <div>
                        Cantidad de agentes:{" "}
                        {formatMiles(payload[0].payload.cantidad)}
                      </div>
                      <div>
                        Porcentaje:{" "}
                        {formatPct(
                          (payload[0].payload.cantidad || 0) / (total || 1),
                        )}
                      </div>
                    </>
                  )}
                </UnifiedTooltip>
              )}
            />
            <Bar dataKey="cantidad" maxBarSize={22} fill={COLOR}>
              <LabelList
                position="right"
                dataKey="cantidad"
                content={(props) => (
                  <ValueLabel {...props} total={total} dark={isDarkMode} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {ordenados.length > PAGE && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </DashboardCard>
  );
};

export default React.memo(AgeRangeByAreaChart);
