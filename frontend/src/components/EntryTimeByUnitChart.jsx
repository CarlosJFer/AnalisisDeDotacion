import React, { useMemo } from "react";
import { Box, Typography, Tooltip as MuiTooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DashboardCard, icons } from "../ui";
import { formatMiles } from "../ui/chart-utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const KEY_SEPARATOR = "__::";

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
}) => {
  const { theme } = useTheme();

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

      const key = unit + KEY_SEPARATOR + time;
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

  const baseColor = theme.palette.primary.main;
  const dividerColor = isDarkMode
    ? "rgba(148, 163, 184, 0.25)"
    : "rgba(148, 163, 184, 0.45)";
  const emptyFill = isDarkMode
    ? "rgba(148, 163, 184, 0.16)"
    : "rgba(226, 232, 240, 0.85)";
  const maxAlpha = 0.82;
  const minAlpha = 0.25;

  const getCellColor = (value) => {
    if (!value) return emptyFill;
    if (!heatmap.maxCount) return alpha(baseColor, minAlpha);
    const ratio = Math.max(0, Math.min(1, value / heatmap.maxCount));
    return alpha(baseColor, minAlpha + ratio * (maxAlpha - minAlpha));
  };

  const getTextColor = (value) => {
    if (!value) return isDarkMode ? "rgba(148, 163, 184, 0.9)" : "rgba(100, 116, 139, 0.9)";
    if (!heatmap.maxCount) {
      return isDarkMode
        ? "rgba(226, 232, 240, 0.95)"
        : "rgba(15, 23, 42, 0.85)";
    }
    const ratio = Math.max(0, Math.min(1, value / heatmap.maxCount));
    if (ratio >= 0.6) return "#ffffff";
    return isDarkMode
      ? "rgba(226, 232, 240, 0.95)"
      : "rgba(15, 23, 42, 0.85)";
  };

  const headerBg = isDarkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(241, 245, 249, 0.95)";
  const headerColor = isDarkMode
    ? "rgba(226, 232, 240, 0.9)"
    : "rgba(15, 23, 42, 0.85)";

  const gridHeight = Math.max(heatmap.units.length * 44 + 120, 360);
  const hasData = heatmap.units.length > 0 && heatmap.times.length > 0;

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
            {heatmap.units.length} unidades - {heatmap.times.length} horarios - {" "}
            {formatMiles(heatmap.totalAgents)} agentes
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
                  border: "1px solid " + dividerColor,
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
                    borderRight: "1px solid " + dividerColor,
                    borderBottom: "1px solid " + dividerColor,
                    backgroundColor: headerBg,
                    color: headerColor,
                  }}
                >
                  Unidad / Horario
                </Box>
                {heatmap.times.map((time) => (
                  <Box
                    key={"header-" + time}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: "12px 8px",
                      textAlign: "center",
                      borderBottom: "1px solid " + dividerColor,
                      borderRight: "1px solid " + dividerColor,
                      backgroundColor: headerBg,
                      color: headerColor,
                    }}
                  >
                    {time}
                  </Box>
                ))}

                {heatmap.units.map((unit) => {
                  const total = heatmap.totalsByUnit.get(unit) || 0;
                  return (
                    <React.Fragment key={"row-" + unit}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 0.5,
                          padding: "12px",
                          borderRight: "1px solid " + dividerColor,
                          borderBottom: "1px solid " + dividerColor,
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
                        const key = unit + KEY_SEPARATOR + time;
                        const value = heatmap.counts.get(key) || 0;
                        const fill = getCellColor(value);
                        const color = getTextColor(value);
                        const borderColor = value
                          ? alpha(baseColor, 0.4)
                          : dividerColor;
                        return (
                          <MuiTooltip
                            key={key}
                            title={
                              unit +
                              " - " +
                              time +
                              ": " +
                              formatMiles(value) +
                              " agentes"
                            }
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
                                color: color,
                                borderRight: "1px solid " + dividerColor,
                                borderBottom: "1px solid " + dividerColor,
                                backgroundColor: fill,
                                position: "relative",
                                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                cursor: "default",
                                "&:hover": {
                                  transform: value ? "scale(1.03)" : "none",
                                  boxShadow: value
                                    ? "0 6px 14px " + alpha(baseColor, 0.25)
                                    : "none",
                                  zIndex: value ? 2 : 1,
                                  borderColor: borderColor,
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
              Menor cantidad
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, " +
                  emptyFill +
                  " 0%, " +
                  alpha(baseColor, maxAlpha) +
                  " 100%)",
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
              Mayor cantidad
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
