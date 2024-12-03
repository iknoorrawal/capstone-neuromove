import { createTheme } from '@mui/material/styles';
import "@fontsource/inter"; // Import Inter font


const theme = createTheme({
  palette: {
    primary: {
      main: '#005c4b', // NeuroMove green
      dark: '#24432f',
    },
    secondary: {
      main: '#f6f6f6',
    },
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",

    h3: {
      fontWeight: 'bold',
      color: '#005c4b',
    },
    h5: {
      color: '#2d4b39',
    },
    body1: {
      color: '#555',
    },
    button: {
      textTransform: 'none', // Prevent uppercase transformation on buttons
    },
  },
  shape: {
    borderRadius: 8, // Default border radius for cards, buttons, etc.
  },
});

export default theme;
