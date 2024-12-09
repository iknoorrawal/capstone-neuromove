// src/Home.js
import React from "react";
import { Link } from "react-router-dom";
import DataFetcherTest from "./testing";
import { GoogleSignupButton, GoogleLoginButton } from "./google-auth";
import { Box, Typography, CircularProgress } from "@mui/material";


function ReachRecallLoad() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #fff, #ffe0f0)",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "#ff6b9b",
          fontWeight: "bold",
          marginBottom: 2,
        }}
      >
        Reach + Recall
      </Typography>
      <Box
        component="img"
        src="/dude 2.png"
        alt="Man illustration"
        sx={{
          width: "80px",
          height: "auto",
          marginBottom: 1,
        }}
      />
    <Typography
      variant="body1"
      sx={{
        color: "#888",
        fontSize: "2rem", // Increase the font size here
      }}
    >
      Loading...
    </Typography>
    </Box>
  );
}

export default ReachRecallLoad;
