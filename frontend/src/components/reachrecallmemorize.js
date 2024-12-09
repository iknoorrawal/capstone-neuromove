import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Home from "./home";
import Dash from "./dash";

function ReachRecallMemorize() {
  const [countdown, setCountdown] = useState(10); // 10 second countdown
  const navigate = useNavigate(); // React Router navigation

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Navigate to another page when countdown ends
    if (countdown === 0) {
      clearInterval(timer);
      navigate("/reachrecallgame"); // Change "/next" to your next page route
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #ff758c, #ff7eb3)",
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* Back Button */}
      <Button
        onClick={() => navigate("/dashboard")}
        sx={{
          position: "absolute",
          top: "16px",
          left: "16px",
          background: "#fff",
          color: "#000",
          borderRadius: "50%",
          padding: "8px",
          minWidth: "32px",
          height: "32px",
          "&:hover": { background: "#f0f0f0" },
        }}
      >
        ←
      </Button>


      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 10,
        }}
      >
        Remember the following numbers on the screen.
      </Typography>

      {/* Numbers */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          marginBottom: 7,
        }}
      >
        {[12, 3, 16].map((number, index) => (
            <Box
                key={index}
                sx={{
                    width: "130px", // Increase the size of the box
                    height: "130px", // Increase the size of the box
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundImage: `url('/bubble 4.png')`, // Image from public folder
                    backgroundSize: "cover", // Make sure the image covers the whole box
                    backgroundPosition: "center",
                    color: "#fff",
                    fontSize: "3rem", // Increase the size of the number
                    fontWeight: "bold",
                }}
            >
            {number}
            </Box>

        ))}
      </Box>

      {/* Countdown Timer */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {countdown}
        </Typography>
      </Box>
    </Box>
  );
}

export default ReachRecallMemorize;
