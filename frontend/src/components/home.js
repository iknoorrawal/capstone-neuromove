import React, { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Box, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo.png";
import WavySeparator from "../assets/wavy-separator.svg";

const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const user = userCredential.user;
      console.log("User logged in:", userCredential.user);
      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        width: "100vw",
        background: `radial-gradient(
          155.21% 108.68% at 63.39% 93.33%,
          rgba(126, 163, 78, 0.50) 9.9%,
          rgba(251, 245, 229, 0.50) 61.58%,
          rgba(126, 163, 78, 0.50) 100%
        ),
        radial-gradient(
          78.78% 74.65% at 37.93% -12.37%,
          #B86539 28.07%,
          #B1DADF 100%
        )`,
        "@media (max-width: 768px)": {
          flexDirection: "column", // Stack sections on smaller screens
        },
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 4rem",
          gap: 2,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="NeuroMove Logo"
          sx={{
            height: "80px",
            width: "auto",
            marginBottom: 2,
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "64px",
            fontWeight: "400",
            color: "var(--teal-900, #004D40)",
            textAlign: "left",
            lineHeight: "1.2",
            letterSpacing: "-1.5px",
          }}
        >
          Welcome to
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "64px",
            fontWeight: "1000",
            color: "var(--teal-900, #004D40)",
            textAlign: "left",
            lineHeight: "1.2",
            letterSpacing: "-1.5px",
          }}
        >
          NeuroMove
        </Typography>
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        {/* SVG Wavy Separator */}
        <Box
          component="img"
          src={WavySeparator}
          alt="Wavy Separator"
          sx={{
            position: "absolute",
            top: 0,
            right: "-20px",
            height: "100%",
            width: "auto",
            objectFit: "contain",
            pointerEvents: "none",
            zIndex: 1,
            "@media (max-width: 768px)": {
              right: "-10px",
            },
            "@media (min-width: 1160px)": {
              width: "160%", // Expand for wide screens
            },
          }}
        />

        {/* Login Form */}
        <Box
          sx={{
            width: "80%",
            maxWidth: "400px",
            padding: 4,
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 2,
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: theme.typography.textPrimary.fontSize,
              textAlign: "left",
              color: theme.typography.textPrimary.color,
              marginBottom: 1,
            }}
          >
            Log In
          </Typography>
          <Typography
            sx={{
              color: theme.typography.textSecondary.color,
              fontSize: "14px",
              textAlign: "left",
              marginBottom: 3,
            }}
          >
            Welcome Back
          </Typography>
          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{
                backgroundColor: "#fdecea",
                padding: "8px",
                borderRadius: "4px",
                textAlign: "center",
                border: "1px solid #f5c2c7",
                color: "#a94442",
                marginBottom: "16px",
              }}
            >
              {error}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#005c4b",
                "&:hover": { backgroundColor: "#003d3a" },
                marginTop: 2,
              }}
            >
              Log In
            </Button>
          </Box>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              color: "#005c4b",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: 2,
            }}
          >
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
