import { createTheme } from "@mui/material";

// Create a custom theme with fixed width issues
export const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#e51937", // Delta red color
    },
    background: {
      default: "#0a0c12", // Darker version of #14161d
      paper: "#14161d",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    allVariants: {
      color: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        contained: {
          backgroundColor: "#e51937", // Delta red
          "&:hover": {
            backgroundColor: "#c0142e", // Darker red on hover
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "1200px !important", // Override maxWidth limitations
          paddingLeft: "24px",
          paddingRight: "24px",
          width: "100%",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#14161d",
          color: "#ffffff",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#14161d",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.2)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.4)",
          },
        },
      },
    },
  },
});
