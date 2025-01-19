import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom"; 
import { TextField, Button, Box, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo.png";
import WavySeparator from "../assets/wavy-separator.svg";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      dob,
      createdAt: new Date(),
    });

    await setDoc(doc(db, "users", user.uid, "game1", "info"), {
      level: "0",
    });

    await setDoc(doc(db, "users", user.uid, "game2", "info"), {
      level: "0",
    });

    await setDoc(doc(db, "users", user.uid, "game3", "info"), {
      level: "0",
    });


      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      setError(err.message);
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
          flexDirection: "column",
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

        {/* Form */}
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
            variant="h6"
            component="h2"
            sx={{
              textAlign: "left", // Align to the left
              color: theme.typography.textPrimary.color,
              fontWeight: "400", // Regular weight
              marginBottom: 2,
            }}
          >
            Sign up
          </Typography>
          {error && (
            <Typography
              color="error"
              sx={{
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              {error}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSignup}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5, // Reduce spacing between fields
            }}
          >
            <TextField
              label="First Name"
              name="firstName"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              label="Last Name"
              name="lastName"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              variant="outlined"
              fullWidth
              required
              InputLabelProps={{ shrink: true }} 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              InputProps={{
                style: { color: "#666" }
              }}
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Create Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#005c4b",
                "&:hover": { backgroundColor: "#003d3a" },
                marginTop: 1.5,
              }}
              onClick={handleSignup}
            >
              Sign Up
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
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Log In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
