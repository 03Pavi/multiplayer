import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0B0F14",
      paper: "#1A202C",
    },
    primary: {
      main: "#22C55E",
      dark: "#16A34A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#3B82F6",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    success: {
      main: "#22C55E",
    },
    info: {
      main: "#06B6D4",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: '"Inter", "Geist", "Manrope", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0B0F14",
          color: "#FFFFFF",
          margin: 0,
          padding: 0,
          fontFamily: '"Inter", "Geist", "Manrope", "Roboto", sans-serif',
          minHeight: "100vh",
          overflowX: "hidden",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 24px",
          fontSize: "0.95rem",
          fontWeight: 600,
          minHeight: "48px",
          transition: "all 0.2s ease-in-out",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 0 12px rgba(34, 197, 94, 0.3)",
          },
        },
        containedPrimary: {
          backgroundColor: "#22C55E",
          "&:hover": {
            backgroundColor: "#16A34A",
          },
        },
        containedSecondary: {
          backgroundColor: "#3B82F6",
          "&:hover": {
            backgroundColor: "#2563EB",
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
          },
        },
        containedError: {
          backgroundColor: "#EF4444",
          "&:hover": {
            backgroundColor: "#DC2626",
            boxShadow: "0 0 12px rgba(239, 68, 68, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A202C",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          backgroundImage: "none",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
});

export default theme;
