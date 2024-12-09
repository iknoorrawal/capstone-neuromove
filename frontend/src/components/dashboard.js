import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // Dropdown state for profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        padding: "24px",
        background: "linear-gradient(135deg, #f7f9fc, #e3eefc)", // Gradient background
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Logo Section (Top Left) */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/Group 1.png" // Replace with your logo in the public folder
          alt="Logo"
          style={{ width: "40px", height: "40px" }}
        />
        <Typography variant="h6" fontWeight="bold">
          NeuroMove
        </Typography>
      </Box>

      {/* Top Section with Profile and Streak */}
      <Box sx={{ display: "flex", justifyContent: "space-between", position: "absolute", top: 16, width: "100%" }}>
        {/* Welcome Section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h3" fontWeight="bold">
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            position: "relative", // Make it relative to adjust its position
            left: "-30px", // Shift the profile section 10px to the left (adjust as needed)
          }}
        >
          <img
            src="/james.png" // Profile image in public folder
            alt="Profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            onClick={handleAvatarClick}
          />
        <Box sx={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            James Jameson
            </Typography>
        </Box>
        </Box>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>

      {/* Streak Section */}
      <Box
        sx={{
          position: "absolute",
          top: "80px", // Adjust this value to fit under the profile section
          right: 16,
          textAlign: "right",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontSize: "3rem", color: "#ff5722" }}>🔥</Typography>
          <Box>
            <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>21</Typography>
            <Typography sx={{ fontSize: "1rem", color: "#555" }}>day streak</Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <Box
                key={index}
                sx={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: index < 5 ? "#ff5722" : "#ddd",
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              marginTop: "4px",
              color: "#555",
            }}
          >
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Welcome Text */}
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{ marginTop: "60px", marginBottom: "32px" }}
      >
        Welcome back, James!
      </Typography>

      {/* Cards */}
      <Box
        sx={{
          display: "flex",
          gap: "32px",
          justifyContent: "center",
          marginTop: "60px", marginBottom: "32px",
        }}
      >
        {/* Balance Quest */}
        <Card
          sx={{
            width: "300px",
            height: "350px",
            background: "linear-gradient(135deg, #fde9a7, #fcb96a)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px",
          }}
        >
          <CardActionArea>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                Balance Quest
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  color: "#000",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Level 0
              </Typography>
            </Box>
            <img
              src="/dude 1.png" // Replace with your image file in the public folder
              alt="Balance Quest"
              style={{ width: "100%", objectFit: "contain", marginTop: "auto" }}
            />
          </CardActionArea>
        </Card>

        {/* Beat Step */}
        <Card
          sx={{
            width: "300px",
            height: "350px",
            background: "linear-gradient(135deg, #c5e3d8, #7ed0c5)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px",
          }}
        >
          <CardActionArea>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                Beat Step
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  color: "#000",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Level 0
              </Typography>
            </Box>
            <img
              src="/dude 3.png" // Replace with your image file in the public folder
              alt="Beat Step"
              style={{ width: "100%", objectFit: "contain", marginTop: "auto" }}
            />
          </CardActionArea>
        </Card>

        {/* Reach + Recall */}
        <Card
          sx={{
            width: "300px",
            height: "350px",
            background: "linear-gradient(135deg, #f8c5da, #f493b5)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px",
          }}
        >
          <CardActionArea onClick={() => navigate("/reachrecallload")}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                Reach + Recall
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  color: "#000",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Level 0
              </Typography>
            </Box>
            <img
              src="/dude 2.png" // Replace with your image file in the public folder
              alt="Reach + Recall"
              style={{ width: "100%", objectFit: "contain", marginTop: "auto" }}
            />
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;
