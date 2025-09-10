import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useTheme } from "../context/ThemeContext.jsx";

const AdminSectionLayout = ({
  title,
  description,
  icon: Icon,
  color,
  maxWidth = 900,
  children,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Box
      sx={{
        maxWidth,
        mx: "auto",
        p: 4,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)",
        borderRadius: 3,
        minHeight: "80vh",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          }}
        >
          {Icon && <Icon sx={{ fontSize: 24 }} />}
        </Avatar>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
          }}
        >
          {title}
        </Typography>
      </Box>

      {description && (
        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: 4,
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
            fontWeight: 400,
          }}
        >
          {description}
        </Typography>
      )}

      {children}
    </Box>
  );
};

export default AdminSectionLayout;
