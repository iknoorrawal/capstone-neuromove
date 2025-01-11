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
            sx={{ textTransform: "none", fontWeight: "bold" , color: "black"}}
          >
            {firstName} {lastName}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
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

        <Grid2 container spacing={8} justifyContent="center">
          <Grid2 item xs={12} md={4}>
            <GameCard
              title="Balance Quest"
              level={`Level ${level}`}
              description="Strengthen your balance and sharpen your mind by switching feet."
              bgColor="#E67A26"
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          </Grid2>

          <Grid2 item xs={12} md={4}>
            <GameCard
              title="Beat Step"
              level={`Level ${level}`}
              description="Train your rhythm and coordination with stepping challenges."
              bgColor="#369B9F"
            />
          </Grid2>

          <Grid2 item xs={12} md={4}>
            <GameCard
              title="Reach & Recall"
              level={`Level ${level}`}
              description="Improve flexibility and memory by reaching and recalling items."
              bgColor="#F46895"
            />
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
};

const GameCard = ({ title, level, description, bgColor }) => {
  return (
    <Card
      sx={{
        width: 355,
        height: 450,
        borderRadius: 3,
        backgroundColor: bgColor,
        color: "#fff",
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <Typography
          variant="overline"
          sx={{
            bgcolor: "#fff",
            color: "#000",
            borderRadius: 1,
            p: "2px 6px",
            display: "inline-block",
            mt: 1,
          }}
        >
          {level}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
