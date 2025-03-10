import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Grid2,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (user.uid !== uid) {
        navigate(`/dashboard/${user.uid}`);
        return;
      }

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("User not found in Firestore");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [uid, navigate]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const firstName = userData?.firstName || "User";
  const lastName = userData?.lastName || "";
  const level = userData?.level || "";

  return (
    <Box sx={{ p: 4, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/logo.png"
            alt="NeuroMove Logo"
            sx={{ width: 40, height: "auto", mr: 1 }}
          />
          <Typography variant="h6" component="span">
            N E U R O M O V E
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          variant="text"
          onClick={handleClick}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            color: "black",
            border: "1px solid #000", // Black border for the boundary
            borderRadius: "24px", // Rounded corners
            padding: "4px 16px", // Padding for consistent spacing
            ":hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)", // Subtle hover effect
            },
          }}
        >
          {firstName} {lastName}
        </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => {
              navigate(`/settings/${uid}`);
              handleClose();
            }}>
              Settings
            </MenuItem>
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ px: 2, maxWidth: 1200, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h2" fontWeight="bold">
              Welcome back,
            </Typography>
            <Typography variant="h2" fontWeight="bold">
              {firstName}!
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "#F0F0F0",
              borderRadius: 3,
              p: 2,
              minWidth: 300,
              minHeight: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Streak Counter (TODO)
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            gap: 4,
            overflowX: "auto",
            px: 2, // Add padding for responsiveness
          }}
        >
          <Grid2 
            item 
            xs={12} 
            md={4} 
            onClick={() => navigate(`/balance-quest/${uid}/home-page`)}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { 
                transform: 'scale(1.05)',
              }
            }}
          >
          <GameCard
            title="Balance Quest"
            description="Strengthen your balance and sharpen your mind by switching feet."
            bgColor="orange"
            image="/balancequest.png" // Replace with your image URL
          />
          </Grid2>
          <GameCard
            title="Beat Step"
            description="Train your rhythm and coordination with stepping challenges."
            bgColor="teal"
            image="/beatstep.png" // Replace with your image URL
          />
          <Grid2 
            item 
            xs={12} 
            md={4} 
            onClick={() => navigate(`/reach-and-recall/${uid}/home-page`)} 
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { 
                transform: 'scale(1.05)',
              }
            }}
          >
            <GameCard
              title="Reach & Recall"
              description="Improve flexibility and memory by reaching and recalling items."
              bgColor="pink"
              image="/reachrecall.png"
            />
          </Grid2>

        </Box>
      </Box>
    </Box>
  );
};

const GameCard = ({ title, description, bgColor, image }) => {

  const gradientColors = {
    orange: "linear-gradient(135deg, #E67A26, #FFB74D)",
    teal: "linear-gradient(135deg, #369B9F, #4DB6AC)",
    pink: "linear-gradient(135deg, #F46895, #F8BBD0)",
  };

  return (
    <Card
      sx={{
        width: 355,
        height: 450,
        borderRadius: 3,
        background: gradientColors[bgColor] || gradientColors.orange, // Default to orange gradient
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {description}
        </Typography>
      </CardContent>
      {image && (
        <Box
          sx={{
            paddingBottom: 2, // Adds padding to the bottom of the image
            backgroundColor: "transparent", // Ensure padding blends with the card background
          }}
        >
          <Box
            component="img"
            src={image}
            alt={`${title} image`}
            sx={{
            width: "100%",
            height: "100%", // Increased height to display the entire image
            objectFit: "scale-down", // Ensures the image scales correctly
            borderRadius: "5px",
          }}
          />
        </Box>
      )}
    </Card>
  );
};


export default Dashboard;
