import React from "react";
import { Card, CardContent, Box, Typography, Icon } from "@mui/material";
import { theme } from "../../ui/theme.js";

const DashboardCard = ({
  title,
  subtitle,
  icon,
  isDarkMode,
  headerRight,
  children,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: theme.radii.lg,
        boxShadow: theme.shadows.dashboard,
        background: isDarkMode ? "rgba(45,55,72,0.8)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: isDarkMode
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.08)",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: theme.palette.primaryHover,
        },
      }}
    >
      {(title || subtitle || headerRight) && (
        <Box
          sx={{
            display: "flex",
            alignItems: subtitle ? "flex-start" : "center",
            justifyContent: "space-between",
            p: 3,
            pb: subtitle ? 0 : 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon && (
              <Icon
                aria-hidden="true"
                sx={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.palette.primary,
                }}
              >
                {icon}
              </Icon>
            )}
            <Box>
              {title && (
                <Typography
                  sx={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: 600,
                    color: isDarkMode
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(0,0,0,0.8)",
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  sx={{
                    fontSize: theme.typography.fontSize.sm,
                    color: isDarkMode
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.6)",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {headerRight && (
            <Box sx={{ fontSize: theme.typography.fontSize.xs }}>
              {headerRight}
            </Box>
          )}
        </Box>
      )}
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
};

export default DashboardCard;
