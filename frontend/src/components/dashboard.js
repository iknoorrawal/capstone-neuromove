import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';

const Dashboard = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsNavigate = () => {
    navigate(`/settings/${uid}`);
    handleClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
    handleClose();
  };

  if (loading) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <CircularProgress />
      </Box>
    );
  }

  const firstName = userData?.firstName || "User";

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: "100vh",
      height: "100vh",
      background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decoration */}
      <Box
        component="img"
        src="/top-left-wavy.png"
        alt=""
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1000px",
          height: "auto",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.8
        }}
      />
      
      {/* Content with higher z-index */}
      <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
        {/* Header */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 6,
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'medium',
              color: '#333'
            }}
          >
            N E U R O M O V E
          </Typography>

          <Box>
            <IconButton 
              onClick={handleSettingsClick}
              sx={{
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '24px',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <SettingsIcon />
              <Typography sx={{ ml: 1 }}>Settings</Typography>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleSettingsNavigate}>Settings</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Welcome and Stats Section */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}>
          {/* Welcome Message */}
          <Box>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: "bold",
                color: '#333',
                mb: 1
              }}
            >
              Welcome back,
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: "bold",
                color: '#333'
              }}
            >
              {firstName}!
            </Typography>
          </Box>

          {/* Stats Box */}
          <Box sx={{
            bgcolor: "#F8F9FA",
            borderRadius: 4,
            p: 3,
            minWidth: 625,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}>
            {/* Streaks */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Streaks
              </Typography>
            </Box>

            {/* Points */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                500 points
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Games Grid */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          mt: 4,
          flex: 1,
          '& > *': {
            height: 'calc(100vh - 400px)',
            maxHeight: '500px',
          }
        }}>
          {/* Balance Quest Card */}
          <Box
            onClick={() => navigate(`/balance-quest/${uid}/home-page`)}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
              background: "linear-gradient(135deg, #E67A26 0%, #FFB74D 100%)",
              p: 3,
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              "&:hover": {
                transform: "scale(1.02)",
                "& .game-description": {
                  opacity: 1,
                },
                "& .game-image": {
                  opacity: 0,
                }
              },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 2 }}>
                Balance Quest
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label="Balance"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "16px",
                  }}
                />
                <Chip
                  label="Decision Making"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "16px",
                  }}
                />
              </Box>
            </Box>
            
            {/* Description (shows on hover) */}
            <Typography 
              className="game-description"
              variant="h5" 
              sx={{ 
                color: "white",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                opacity: 0,
                transition: "opacity 0.3s ease-in-out",
                fontWeight: "medium"
              }}
            >
              Strengthen your balance and sharping your mind by switching feet to sort the items right.
            </Typography>

            {/* Image (hides on hover) */}
            <Box
              className="game-image"
              component="img"
              src="/balancequest.png"
              alt="Balance Quest"
              sx={{
                width: "100%",
                height: "auto",
                mt: "auto",
                objectFit: "contain",
                maxHeight: "60%",
                opacity: 1,
                transition: "opacity 0.3s ease-in-out"
              }}
            />
          </Box>

          {/* Reach & Recall Card */}
          <Box
            onClick={() => navigate(`/reach-and-recall/${uid}/home-page`)}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
              background: "linear-gradient(135deg, #F46895 0%, #F8BBD0 100%)",
              p: 3,
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              "&:hover": {
                transform: "scale(1.02)",
                "& .game-description": {
                  opacity: 1,
                },
                "& .game-image": {
                  opacity: 0,
                }
              },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 2 }}>
                Reach & Recall
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label="Reaching"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "16px",
                  }}
                />
                <Chip
                  label="Memory"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "16px",
                  }}
                />
              </Box>
            </Box>

            {/* Description (shows on hover) */}
            <Typography 
              className="game-description"
              variant="h5" 
              sx={{ 
                color: "white",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                opacity: 0,
                transition: "opacity 0.3s ease-in-out",
                fontWeight: "medium"
              }}
            >
              Train your memory and improve flexibility by reaching and recalling the correct sequence of items.
            </Typography>

            {/* Image (hides on hover) */}
            <Box
              className="game-image"
              component="img"
              src="/reachrecall.png"
              alt="Reach & Recall"
              sx={{
                width: "100%",
                height: "auto",
                mt: "auto",
                objectFit: "contain",
                maxHeight: "60%",
                opacity: 1,
                transition: "opacity 0.3s ease-in-out"
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
