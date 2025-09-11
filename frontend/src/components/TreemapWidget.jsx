import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Box, Typography } from "@mui/material";
import DashboardCard from "./ui/DashboardCard.jsx";
import { rechartsCommon, UnifiedTooltip, icons, theme } from "../ui";

const TreemapWidget = ({ data, isDarkMode }) => {
  const { tooltipProps } = rechartsCommon(isDarkMode);
  const palette = useMemo(() => Object.values(theme.palette), []);

  const processedData = useMemo(
    () =>
      (data || []).map((item, index) => ({
        ...item,
        fill: palette[index % palette.length],
      })),
    [data, palette],
  );

  if (!processedData.length) {
    return (
      <DashboardCard
        title="Estructura"
        icon={<icons.distribucion />}
        isDarkMode={isDarkMode}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="body2" color="text.secondary">
            No hay datos de estructura disponibles
          </Typography>
        </Box>
      </DashboardCard>
    );
  }

  const CustomContent = ({
    depth,
    x,
    y,
    width,
    height,
    name,
    value,
    payload,
  }) => {
    if (depth === 1) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: payload.fill,
              stroke: "#fff",
              strokeWidth: 2,
              strokeOpacity: 1,
            }}
          />
          {width > 60 && height > 30 && (
            <>
              <text
                x={x + width / 2}
                y={y + height / 2 - 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
              >
                {name}
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2 + 10}
                textAnchor="middle"
                fill="#fff"
                fontSize="10"
              >
                {value}
              </text>
            </>
          )}
        </g>
      );
    }
    return null;
  };

  return (
    <DashboardCard
      title="Estructura"
      icon={<icons.distribucion />}
      isDarkMode={isDarkMode}
    >
      <Box sx={{ width: "100%", height: "100%", minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={processedData}
            dataKey="value"
            ratio={4 / 3}
            stroke="#fff"
            content={<CustomContent />}
          >
            <Tooltip
              {...tooltipProps}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <UnifiedTooltip
                    active={active}
                    payload={payload}
                    label={d.name || d.departamento}
                    dark={isDarkMode}
                  >
                    <div>Personal: {d.value || d.cantidad}</div>
                    {d.porcentaje && <div>Porcentaje: {d.porcentaje}%</div>}
                    {d.presupuesto && (
                      <div>
                        Presupuesto: $
                        {d.presupuesto.toLocaleString("es-AR")}
                      </div>
                    )}
                  </UnifiedTooltip>
                );
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};

export default TreemapWidget;

