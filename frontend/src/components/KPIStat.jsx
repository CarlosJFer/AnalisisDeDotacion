import React from "react";
import { Box, Typography } from "@mui/material";
import { theme, modeVars, icons } from "./ui";

const KPIStat = ({ metric, label, value, delta, isDarkMode }) => {
  const Icon = icons[metric];
  const vars = modeVars(isDarkMode);

  const deltaColor =
    typeof delta === "number"
      ? delta > 0
        ? "success.main"
        : delta < 0
          ? "error.main"
          : "text.secondary"
      : "text.secondary";

  const textPrimary = isDarkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  const textSecondary = isDarkMode
    ? "rgba(255,255,255,0.7)"
    : "rgba(0,0,0,0.6)";

  return (
    <Box
      sx={{
        ...vars,
        p: 2,
        height: "100%",
        borderRadius: theme.radii.md,
        backgroundColor: "var(--bg-color)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          sx={{
            fontSize: theme.typography.fontSize.xl,
            color: theme.palette.primary,
            mb: 1,
          }}
        />
      )}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: theme.typography.fontSize.lg,
          color: textPrimary,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: theme.typography.fontSize.sm,
          color: textSecondary,
        }}
      >
        {label}
      </Typography>
      {typeof delta === "number" && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: theme.typography.fontSize.xs,
            color: deltaColor,
          }}
        >
          {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
        </Typography>
      )}
    </Box>
  );
};

export default KPIStat;
