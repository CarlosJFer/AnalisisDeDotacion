import React, { useMemo } from "react";
import CustomLineChart from "./CustomLineChart";

const MAX_SERIES = 5;
const OTHERS_LABEL = "Otros";

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
  const { chartData, series } = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
      return { chartData: [], series: [] };
    }

    const normalized = rows
      .map((row) => {
        const time = normalizeText(row?.time, "Sin horario");
        const unit = normalizeText(row?.unit, "Sin unidad");
        const count = Number(row?.count) || 0;
        return { time, unit, count };
      })
      .filter((row) => row.count >= 0);

    if (!normalized.length) {
      return { chartData: [], series: [] };
    }

    const totals = new Map();
    for (const { unit, count } of normalized) {
      totals.set(unit, (totals.get(unit) || 0) + count);
    }

    const sortedUnits = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const primaryUnits = sortedUnits.slice(0, MAX_SERIES).map(([unit]) => unit);
    const extraUnits = sortedUnits.slice(MAX_SERIES).map(([unit]) => unit);
    const hasExtras = extraUnits.length > 0;

    const timeMap = new Map();
    let othersTotal = 0;

    const ensureRecord = (time, includeOthers) => {
      if (!timeMap.has(time)) {
        const base = { time };
        primaryUnits.forEach((unit) => {
          base[unit] = 0;
        });
        if (includeOthers) {
          base[OTHERS_LABEL] = 0;
        }
        timeMap.set(time, base);
      }
      return timeMap.get(time);
    };

    for (const { time, unit, count } of normalized) {
      const targetUnit = primaryUnits.includes(unit)
        ? unit
        : hasExtras
          ? OTHERS_LABEL
          : null;
      if (!targetUnit) continue;
      const record = ensureRecord(time, hasExtras);
      record[targetUnit] = (record[targetUnit] || 0) + count;
      if (targetUnit === OTHERS_LABEL) {
        othersTotal += count;
      }
    }

    if (!timeMap.size) {
      return { chartData: [], series: [] };
    }

    const includeOthers = hasExtras && othersTotal > 0;

    const sortedTimes = [...timeMap.keys()].sort((a, b) => {
      const aMinutes = parseTimeLabel(a);
      const bMinutes = parseTimeLabel(b);
      if (aMinutes !== null && bMinutes !== null) return aMinutes - bMinutes;
      if (aMinutes !== null) return -1;
      if (bMinutes !== null) return 1;
      return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
    });

    const seriesKeys = [...primaryUnits];
    if (includeOthers) {
      seriesKeys.push(OTHERS_LABEL);
    }

    const prepared = sortedTimes.map((time) => {
      const original = timeMap.get(time);
      const entry = { time };
      seriesKeys.forEach((key) => {
        entry[key] = Number(original?.[key]) || 0;
      });
      return entry;
    });

    const series = seriesKeys.map((key) => ({
      dataKey: key,
      name: key,
    }));

    return { chartData: prepared, series };
  }, [data]);

  const primaryKey = series[0]?.dataKey || "count";

  return (
    <CustomLineChart
      data={chartData}
      xKey="time"
      yKey={primaryKey}
      series={series}
      title={title}
      isDarkMode={isDarkMode}
      height={400}
    />
  );
};

export default EntryTimeByUnitChart;
