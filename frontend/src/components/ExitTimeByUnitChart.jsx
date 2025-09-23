import React from "react";
import EntryTimeByUnitChart from "./EntryTimeByUnitChart.jsx";

const EXIT_COLOR_STOPS_LIGHT = [
  { stop: 0, color: "#fdf4ff" },
  { stop: 0.35, color: "#e9d5ff" },
  { stop: 0.65, color: "#c084fc" },
  { stop: 1, color: "#7c3aed" },
];

const EXIT_COLOR_STOPS_DARK = [
  { stop: 0, color: "#1e1b4b" },
  { stop: 0.35, color: "#6d28d9" },
  { stop: 0.65, color: "#9333ea" },
  { stop: 1, color: "#f472b6" },
];

const ExitTimeByUnitChart = ({
  title,
  colorStopsLight,
  colorStopsDark,
  emptyFillLight,
  emptyFillDark,
  zeroTextLight,
  zeroTextDark,
  legendMinLabel,
  legendMaxLabel,
  ...rest
}) => (
  <EntryTimeByUnitChart
    {...rest}
    title={title ?? "Cantidad de agentes segun horario de salida por tipo de unidad de registracion"}
    colorStopsLight={colorStopsLight ?? EXIT_COLOR_STOPS_LIGHT}
    colorStopsDark={colorStopsDark ?? EXIT_COLOR_STOPS_DARK}
    emptyFillLight={emptyFillLight ?? "#f4f1ff"}
    emptyFillDark={emptyFillDark ?? "rgba(37, 24, 86, 0.55)"}
    zeroTextLight={zeroTextLight ?? "rgba(76, 29, 149, 0.9)"}
    zeroTextDark={zeroTextDark ?? "rgba(226, 232, 240, 0.92)"}
    legendMinLabel={legendMinLabel ?? "Menor cantidad"}
    legendMaxLabel={legendMaxLabel ?? "Mayor cantidad"}
  />
);

export default ExitTimeByUnitChart;
