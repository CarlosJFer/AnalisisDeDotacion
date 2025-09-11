import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip
      title={isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
          background: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.7)",
          border: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.08)",
          "&:hover": {
            background: isDarkMode
              ? "rgba(255, 193, 7, 0.2)"
              : "rgba(255, 193, 7, 0.15)",
            color: isDarkMode ? "#ffc107" : "#f57c00",
            transform: "scale(1.1)",
            boxShadow: isDarkMode
              ? "0 6px 20px rgba(255, 193, 7, 0.3)"
              : "0 6px 20px rgba(255, 193, 7, 0.2)",
          },
          transition: "all 0.3s ease",
        }}
      >
        {isDarkMode ? <icons.sol /> : <icons.luna />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
