import React, { memo } from "react";
import { Box, Skeleton, Card, Avatar, Typography } from "@mui/material";
import { useTheme } from "../context/ThemeContext.jsx";
import { optimizedStyles } from "../utils/performance.js";

// Skeleton optimizado para tablas
export const TableSkeleton = memo(({ rows = 5, columns = 4 }) => {
  const { isDarkMode } = useTheme();

  return (
    <Card sx={optimizedStyles.glassmorphism(isDarkMode, "normal")}>
      <Box sx={{ p: 2 }}>
        {/* Header skeleton */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={`${100 / columns}%`}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>

        {/* Rows skeleton */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "flex", gap: 2, mb: 1 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${100 / columns}%`}
                height={32}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Card>
  );
});

// Skeleton para cards
export const CardSkeleton = memo(({ count = 3 }) => {
  const { isDarkMode } = useTheme();

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            ...optimizedStyles.glassmorphism(isDarkMode, "normal"),
            p: 3,
            minWidth: 280,
            flex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Skeleton
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Card>
      ))}
    </Box>
  );
});

// Skeleton para organigrama
export const OrganigramaSkeleton = memo(
  ({ levels = 3, itemsPerLevel = [1, 3, 6] }) => {
    const { isDarkMode } = useTheme();

    return (
      <Card sx={optimizedStyles.glassmorphism(isDarkMode, "normal")}>
        <Box sx={{ p: 3 }}>
          {Array.from({ length: levels }).map((_, levelIndex) => (
            <Box key={levelIndex} sx={{ ml: levelIndex * 3, mb: 2 }}>
              {Array.from({ length: itemsPerLevel[levelIndex] || 2 }).map(
                (_, itemIndex) => (
                  <Box
                    key={itemIndex}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                      p: 1,
                      borderRadius: 2,
                      background: isDarkMode
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="circular" width={20} height={20} />
                  </Box>
                ),
              )}
            </Box>
          ))}
        </Box>
      </Card>
    );
  },
);

// Skeleton para formularios
export const FormSkeleton = memo(({ fields = 4 }) => {
  const { isDarkMode } = useTheme();

  return (
    <Card sx={optimizedStyles.glassmorphism(isDarkMode, "normal")}>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="40%" height={28} />
        </Box>

        {/* Fields */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          {Array.from({ length: fields }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={200}
              height={56}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>

        {/* Button */}
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Card>
  );
});

// Skeleton para dashboard
export const DashboardSkeleton = memo(() => {
  const { isDarkMode } = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width="30%" height={36} />
      </Box>

      {/* Stats cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            sx={{
              ...optimizedStyles.glassmorphism(isDarkMode, "normal"),
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={32} />
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Charts area */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
        <Card sx={optimizedStyles.glassmorphism(isDarkMode, "normal")}>
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </Card>

        <Card sx={optimizedStyles.glassmorphism(isDarkMode, "normal")}>
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Skeleton
              variant="circular"
              width={200}
              height={200}
              sx={{ mx: "auto", display: "block" }}
            />
          </Box>
        </Card>
      </Box>
    </Box>
  );
});

// Loading spinner optimizado
export const OptimizedSpinner = memo(({ size = 40, color = "primary" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          border: `3px solid transparent`,
          borderTop: `3px solid`,
          borderTopColor: color === "primary" ? "#4caf50" : color,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
    </Box>
  );
});

// Componente principal de loading con diferentes variantes
const OptimizedLoading = memo(
  ({
    variant = "spinner",
    rows = 5,
    columns = 4,
    count = 3,
    fields = 4,
    size = 40,
    color = "primary",
  }) => {
    switch (variant) {
      case "table":
        return <TableSkeleton rows={rows} columns={columns} />;
      case "cards":
        return <CardSkeleton count={count} />;
      case "organigrama":
        return <OrganigramaSkeleton />;
      case "form":
        return <FormSkeleton fields={fields} />;
      case "dashboard":
        return <DashboardSkeleton />;
      case "spinner":
      default:
        return <OptimizedSpinner size={size} color={color} />;
    }
  },
);

export default OptimizedLoading;
