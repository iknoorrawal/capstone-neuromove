import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Divider } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import clayman from "../assets/clayman.png";
import logo from "../assets/logo.png";

const Home = () => {
  const textRef = useRef(null);
  const [logoHeight, setLogoHeight] = useState(null);

  useEffect(() => {
    // Dynamically calculate the height of the text block
    if (textRef.current) {
      setLogoHeight(textRef.current.offsetHeight);
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        position: "relative",
        minWidth: "100vw",
        background: "linear-gradient(to right, #e5f5ee, #f6d6bd)",
        overflow: "hidden",
      }}
    >
      {/* Left Section: Illustration */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={clayman}
          alt="Character Illustration"
          sx={{
            maxWidth: "100%",
            height: "auto",
            maxHeight: "90vh",
            position: "absolute",
            bottom: "0",
          }}
        />
      </Box>

      {/* Right Section: Title and Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 4,
        }}
      >
        {/* Welcome to NeuroMove */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            textAlign: "left" }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "normal",
                color: "#005c4b",
                lineHeight: "1.2",
              }}
            >
              Welcome to
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "800",
                color: "#005c4b",
                lineHeight: "1.2",
              }}
            >
              NeuroMove
            </Typography>
          </Box>
          <Box
            component="img"
            src={logo}
            alt="NeuroMove Logo"
            sx={{
               height: logoHeight ? `${logoHeight}px` : "50px",
              width: "auto",
            }}
          />
        </Box>


        {/* Login Form Card*/}
        <Box
          sx={{
            width: "80%",
            maxWidth: "400px",
            padding: 4,
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              textAlign: "center",
              color: "#2d4b39",
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            Log In
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "#555",
              marginBottom: 3,
            }}
          >
            Welcome Back
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Login form submitted");
            }}
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
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
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
          <Divider sx={{ my: 3 }}>or</Divider>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FcGoogle />}
            sx={{
              marginBottom: 2,
              borderColor: "#ccc",
              color: "#555",
            }}
          >
            Sign In With Google
          </Button>
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
