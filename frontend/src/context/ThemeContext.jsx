import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { palette } from "../ui/theme.js";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un CustomThemeProvider");
  }
  return context;
};

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.primary,
      light: palette.primaryLight,
      dark: palette.primary,
    },
    background: {
      default: palette.backgroundLight,
      paper: palette.backgroundLight,
    },
    text: {
      primary: palette.textLight,
      secondary: palette.textLight,
    },
    primaryHover: palette.primaryHover,
    hover: palette.hoverLight,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: theme.palette.primaryHover,
          },
        }),
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.primary,
      light: palette.primaryLight,
      dark: palette.primary,
    },
    background: {
      default: palette.backgroundDark,
      paper: palette.backgroundDark,
    },
    text: {
      primary: palette.textDark,
      secondary: palette.textDark,
    },
    primaryHover: palette.primaryHover,
    hover: palette.hoverDark,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          borderRadius: "12px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: theme.palette.primaryHover,
          },
        }),
      },
    },
  },
});

export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [accessibility, setAccessibility] = useState(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved
      ? JSON.parse(saved)
      : {
          fontSize: "medium",
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
        };
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify(accessibility),
    );
  }, [isDarkMode, accessibility]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateAccessibility = (newSettings) => {
    setAccessibility((prev) => ({ ...prev, ...newSettings }));
  };

  const baseTheme = isDarkMode ? darkTheme : lightTheme;

  // Aplicar configuraciones de accesibilidad
  const accessibleTheme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        typography: {
          ...baseTheme.typography,
          fontSize:
            accessibility.fontSize === "large"
              ? 16
              : accessibility.fontSize === "small"
                ? 12
                : 14,
        },
        palette: {
          ...baseTheme.palette,
          ...(accessibility.highContrast && {
            primary: { main: isDarkMode ? "#ffffff" : "#000000" },
            text: {
              primary: isDarkMode ? "#ffffff" : "#000000",
              secondary: isDarkMode ? "#cccccc" : "#333333",
            },
          }),
        },
        transitions: {
          ...baseTheme.transitions,
          ...(accessibility.reducedMotion && {
            create: () => "none",
          }),
        },
      }),
    [baseTheme, accessibility],
  );

  const value = {
    isDarkMode,
    toggleTheme,
    accessibility,
    updateAccessibility,
    theme: accessibleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={accessibleTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
