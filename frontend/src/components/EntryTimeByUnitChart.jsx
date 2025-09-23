import React, { useMemo, useState, useEffect } from "react";
import { Box, Typography, Tooltip as MuiTooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DashboardCard, icons, PaginationControls } from "../ui";
import { formatMiles } from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const KEY_SEPARATOR = "__::";
const ROWS_PER_PAGE = 5;

const DEFAULT_COLOR_STOPS_LIGHT = [
  { stop: 0, color: "#f8fafc" },
  { stop: 0.35, color: "#fde68a" },
  { stop: 0.65, color: "#fb923c" },
  { stop: 1, color: "#c2410c" },
];

const DEFAULT_COLOR_STOPS_DARK = [
  { stop: 0, color: "#1e293b" },
  { stop: 0.35, color: "#fb923c" },
  { stop: 0.65, color: "#f97316" },
  { stop: 1, color: "#facc15" },
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex) => {
  if (hex === null || hex === undefined) {
    return { r: 0, g: 0, b: 0 };
  }
  const value = String(hex).trim();
  if (!value.length) {
    return { r: 0, g: 0, b: 0 };
  }
  if (value.startsWith("#")) {
    const normalized = value.replace("#", "");
    const list =
      normalized.length === 3
        ? normalized.split("").map((ch) => parseInt(ch + ch, 16))
        : [0, 2, 4].map((idx) => parseInt(normalized.slice(idx, idx + 2), 16));
    return { r: list[0] || 0, g: list[1] || 0, b: list[2] || 0 };
  }
  const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(value);
  if (match) {
    return {
      r: Number(match[1]) || 0,
      g: Number(match[2]) || 0,
      b: Number(match[3]) || 0,
    };
  }
  return { r: 0, g: 0, b: 0 };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (num) => Math.max(0, Math.min(255, num)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHexColors = (start, end, t) => {
  const a = hexToRgb(start);
  const b = hexToRgb(end);
  const ratio = clamp(t, 0, 1);
  return rgbToHex({
    r: Math.round(a.r + (b.r - a.r) * ratio),
    g: Math.round(a.g + (b.g - a.g) * ratio),
    b: Math.round(a.b + (b.b - a.b) * ratio),
  });
};

const colorFromScale = (ratio, stops) => {
  if (!Array.isArray(stops) || !stops.length) return "#000000";
  const value = clamp(ratio, 0, 1);
  for (let i = 1; i < stops.length; i += 1) {
    const current = stops[i];
    if (value <= current.stop) {
      const previous = stops[i - 1];
      const section = current.stop - previous.stop || 1;
      const localT = section === 0 ? 0 : (value - previous.stop) / section;
      return mixHexColors(previous.color, current.color, localT);
    }
  }
  return stops[stops.length - 1].color;
};

const normalizeText = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  const str = value.toString().trim();
  return str.length ? str : fallback;
};

const parseTimeLabel = (label) => {
  const match = /^([0-9]{1,2}):([0-9]{2})/.exec(label);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const EntryTimeByUnitChart = ({
  data,
  isDarkMode,
  title = "Cantidad de agentes segun horario de entrada por tipo de unidad de registracion",
  colorStopsLight = DEFAULT_COLOR_STOPS_LIGHT,
  colorStopsDark = DEFAULT_COLOR_STOPS_DARK,
  emptyFillLight = "#f1f5f9",
  emptyFillDark = "rgba(30, 41, 59, 0.55)",
  zeroTextLight = "rgba(71, 85, 105, 0.9)",
  zeroTextDark = "rgba(148, 163, 184, 0.9)",
  legendMinLabel = "Menor cantidad",
  legendMaxLabel = "Mayor cantidad",
}) => {
  const { theme } = useTheme();
  const [page, setPage] = useState(0);

  const heatmap = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
      return {
        times: [],
        units: [],
        counts: new Map(),
        maxCount: 0,
        totalsByUnit: new Map(),
        totalAgents: 0,
      };
    }

    const counts = new Map();
    const timesSet = new Set();
    const unitsSet = new Set();
    const totalsByUnit = new Map();
    let maxCount = 0;
    let totalAgents = 0;

    rows.forEach((row) => {
      const time = normalizeText(row?.time, "Sin horario");
      const unit = normalizeText(row?.unit, "Sin unidad");
      const count = Number(row?.count) || 0;
      if (count < 0) return;

      const key = `${unit}${KEY_SEPARATOR}${time}`;
      const current = counts.get(key) || 0;
      const nextValue = current + count;
      counts.set(key, nextValue);
      maxCount = Math.max(maxCount, nextValue);
      totalAgents += count;

      timesSet.add(time);
      unitsSet.add(unit);
      totalsByUnit.set(unit, (totalsByUnit.get(unit) || 0) + count);
    });

    const times = Array.from(timesSet).sort((a, b) => {
      const aMinutes = parseTimeLabel(a);
      const bMinutes = parseTimeLabel(b);
      if (aMinutes !== null && bMinutes !== null) return aMinutes - bMinutes;
      if (aMinutes !== null) return -1;
      if (bMinutes !== null) return 1;
      return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
    });

    const units = Array.from(unitsSet).sort((a, b) => {
      const totalA = totalsByUnit.get(a) || 0;
      const totalB = totalsByUnit.get(b) || 0;
      if (totalA !== totalB) return totalB - totalA;
      return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
    });

    return { times, units, counts, maxCount, totalsByUnit, totalAgents };
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(heatmap.units.length / ROWS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (clampedPage !== page) {
      setPage(clampedPage);
    }
  }, [clampedPage, page]);

  const startIndex = clampedPage * ROWS_PER_PAGE;
  const pagedUnits = heatmap.units.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const paletteStopsCandidate = isDarkMode ? colorStopsDark : colorStopsLight;
  const colorStops =
    Array.isArray(paletteStopsCandidate) && paletteStopsCandidate.length
      ? paletteStopsCandidate
      : isDarkMode
        ? DEFAULT_COLOR_STOPS_DARK
        : DEFAULT_COLOR_STOPS_LIGHT;

  const strongColor = colorStops[colorStops.length - 1]?.color || theme.palette.primary.main;
  const emptyFill = (isDarkMode ? emptyFillDark : emptyFillLight) || "#f1f5f9";
  const zeroTextColor = (isDarkMode ? zeroTextDark : zeroTextLight) || (isDarkMode ? "#e2e8f0" : "#475569");
  const legendStart = colorStops[0]?.color || emptyFill;
  const legendEnd = strongColor;

  const getReadableTextColor = (color) => {
    const { r, g, b } = hexToRgb(color);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.55 ? "#f8fafc" : "#0f172a";
  };

  const getCellColor = (value) => {
    if (!value) return emptyFill;
    if (!heatmap.maxCount) {
      const fallbackIndex = Math.max(0, Math.min(colorStops.length - 1, 1));
      return colorStops[fallbackIndex]?.color || strongColor;
    }
    const ratio = clamp(value / heatmap.maxCount, 0, 1);
    return colorFromScale(ratio, colorStops);
  };

  const getTextColor = (value) => {
    if (!value) return zeroTextColor;
    if (!heatmap.maxCount) {
      return getReadableTextColor(strongColor);
    }
    const ratio = clamp(value / heatmap.maxCount, 0, 1);
    const cellColor = colorFromScale(ratio, colorStops);
    return getReadableTextColor(cellColor);
  };

  const headerBg = isDarkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(241, 245, 249, 0.95)";
  const headerColor = isDarkMode ? "rgba(226, 232, 240, 0.9)" : "rgba(15, 23, 42, 0.85)";

  const gridHeight = Math.max(pagedUnits.length * 44 + 120, 360);
  const hasData = heatmap.units.length > 0 && heatmap.times.length > 0;
  const pageInfo = totalPages > 1 ? ` | pagina ${clampedPage + 1} de ${totalPages}` : "";

  return (
    <DashboardCard
      title={title}
      icon={<icons.tiempo />}
      isDarkMode={isDarkMode}
    >
      {hasData ? (
        <>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mb: 2,
              color: isDarkMode
                ? "rgba(226, 232, 240, 0.75)"
                : "rgba(71, 85, 105, 0.85)",
            }}
          >
            {heatmap.units.length} unidades - {heatmap.times.length} horarios -{" "}
            {formatMiles(heatmap.totalAgents)} agentes{pageInfo}
          </Typography>
          <Box sx={{ overflowX: "auto", pb: 2 }}>
            <Box
              sx={{
                minWidth: Math.max(heatmap.times.length * 88 + 220, 680),
                minHeight: gridHeight,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "220px repeat(" + heatmap.times.length + ", minmax(80px, 1fr))",
                  border: "1px solid " + alpha(strongColor, 0.25),
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "12px",
                    borderRight: "1px solid " + alpha(strongColor, 0.25),
                    borderBottom: "1px solid " + alpha(strongColor, 0.25),
                    backgroundColor: headerBg,
                    color: headerColor,
                  }}
                >
                  Unidad / Horario
                </Box>
                {heatmap.times.map((time) => (
                  <Box
                    key={`header-${time}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: "12px 8px",
                      textAlign: "center",
                      borderBottom: "1px solid " + alpha(strongColor, 0.25),
                      borderRight: "1px solid " + alpha(strongColor, 0.25),
                      backgroundColor: headerBg,
                      color: headerColor,
                    }}
                  >
                    {time}
                  </Box>
                ))}

                {pagedUnits.map((unit) => {
                  const total = heatmap.totalsByUnit.get(unit) || 0;
                  return (
                    <React.Fragment key={`row-${unit}`}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 0.5,
                          padding: "12px",
                          borderRight: "1px solid " + alpha(strongColor, 0.25),
                          borderBottom: "1px solid " + alpha(strongColor, 0.25),
                          backgroundColor: isDarkMode
                            ? "rgba(15, 23, 42, 0.6)"
                            : "rgba(248, 250, 252, 0.9)",
                          color: headerColor,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {unit}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDarkMode
                              ? "rgba(148, 163, 184, 0.9)"
                              : "rgba(71, 85, 105, 0.85)",
                          }}
                        >
                          {formatMiles(total)} agentes
                        </Typography>
                      </Box>
                      {heatmap.times.map((time) => {
                        const key = `${unit}${KEY_SEPARATOR}${time}`;
                        const value = heatmap.counts.get(key) || 0;
                        const fill = getCellColor(value);
                        const color = getTextColor(value);
                        const borderColor = value
                          ? alpha(strongColor, 0.35)
                          : alpha(strongColor, 0.25);
                        return (
                          <MuiTooltip
                            key={key}
                            title={`${unit} - ${time}: ${formatMiles(value)} agentes`}
                            placement="top"
                          >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "10px",
                                    minHeight: 44,
                                    fontWeight: value ? 600 : 500,
                                    fontSize: 14,
                                    color,
                                    borderRight: "1px solid " + borderColor,
                                    borderBottom: "1px solid " + borderColor,
                                    backgroundColor: fill,
                                    position: "relative",
                                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                    cursor: "default",
                                    "&:hover": {
                                      transform: value ? "scale(1.03)" : "none",
                                      boxShadow: value
                                        ? "0 6px 14px " + alpha(strongColor, 0.25)
                                        : "none",
                                      zIndex: value ? 2 : 1,
                                      borderColor,
                                    },
                                  }}
                                >
                                  {value ? formatMiles(value) : "-"}
                                </Box>
                          </MuiTooltip>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </Box>
            </Box>
          </Box>
          {totalPages > 1 && (
            <PaginationControls
              page={clampedPage}
              totalPages={totalPages}
              onPrev={() => setPage((prev) => Math.max(0, prev - 1))}
              onNext={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            />
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 2,
              px: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode
                  ? "rgba(148, 163, 184, 0.9)"
                  : "rgba(71, 85, 105, 0.9)",
              }}
            >
              {legendMinLabel}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${legendStart} 0%, ${legendEnd} 100%)`,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode
                  ? "rgba(148, 163, 184, 0.9)"
                  : "rgba(71, 85, 105, 0.9)",
              }}
            >
              {legendMaxLabel}
            </Typography>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDarkMode
              ? "rgba(226, 232, 240, 0.75)"
              : "rgba(71, 85, 105, 0.75)",
          }}
        >
          Sin datos para mostrar
        </Box>
      )}
    </DashboardCard>
  );
};

export default EntryTimeByUnitChart;
