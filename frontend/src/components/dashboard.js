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
  Snackbar,
  Alert,
  Zoom,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
// Import rank icons
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import TerrainIcon from '@mui/icons-material/Terrain';
import RouteIcon from '@mui/icons-material/Route';

// Define rank thresholds and information
const RANKS = [
  { name: "Wanderer", threshold: 0, icon: ExploreIcon, color: "#8D6E63" },
  { name: "Scout", threshold: 1500, icon: MapIcon, color: "#78909C" },
  { name: "Explorer", threshold: 3000, icon: SearchIcon, color: "#43A047" },
  { name: "Treasure Seeker", threshold: 5000, icon: SearchIcon, color: "#FFA000" },
  { name: "Pioneer", threshold: 8000, icon: EmojiFlagsIcon, color: "#5C6BC0" },
  { name: "Trailblazer", threshold: 10000, icon: RouteIcon, color: "#D81B60" },
];

// Function to determine user's rank based on points
const getUserRank = (points) => {
  // Find the highest rank the user qualifies for
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].threshold) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // Default to lowest rank
};

// Function to find the next rank
const getNextRank = (currentRank) => {
  const currentIndex = RANKS.findIndex(rank => rank.name === currentRank.name);
  if (currentIndex < RANKS.length - 1) {
    return RANKS[currentIndex + 1];
  }
  return null; // No higher rank available
};

const Dashboard = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);

  // State for weekly login tracking
  const [weeklyLogins, setWeeklyLogins] = useState({});
  // State for streak count
  const [currentStreak, setCurrentStreak] = useState(0);
  // State for user points
  const [totalPoints, setTotalPoints] = useState(0);
  // State for user rank
  const [currentRank, setCurrentRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  // State for rank-up notification
  const [rankUpNotification, setRankUpNotification] = useState(false);
  const [newRankName, setNewRankName] = useState("");
  // State for rank-up animation
  const [showRankAnimation, setShowRankAnimation] = useState(false);

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
          const userData = userSnap.data();
          setUserData(userData);
          
          // Set the streak and weekly login data without updating them
          setWeeklyLogins(userData.weeklyLogins || {});
          setCurrentStreak(userData.currentStreak || 0);
          setTotalPoints(userData.totalPoints || 0);
          
          // Calculate user's rank based on points
          const rankObj = getUserRank(userData.totalPoints || 0);
          setCurrentRank(rankObj);
          
          // Determine next rank
          const nextRankObj = getNextRank(rankObj);
          setNextRank(nextRankObj);
          
          // Check if there's a rank-up notification in the URL or from localStorage
          // This could be implemented if you want to show rank-up notifications
          // when navigating to the dashboard after a rank-up elsewhere
          
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

  const handleRankNotificationClose = () => {
    setRankUpNotification(false);
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

  // Generate the array of days for the current week (Monday to Sunday)
  const generateWeekDays = () => {
    if (!weeklyLogins.weekStartDate) return [];
    
    const weekStart = new Date(weeklyLogins.weekStartDate);
    const today = new Date();
    
    return Array(7).fill().map((_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateISO = date.toISOString().split('T')[0];
      
      // Determine day status:
      // - checkmark: user logged in on this day
      // - gray: day has passed but user didn't log in
      // - blank: current day or future day
      let status = "blank";
      
      if (weeklyLogins.daysLoggedIn && weeklyLogins.daysLoggedIn[dateISO]) {
        status = "checkmark";
      } else if (date < today && date.getDate() !== today.getDate()) {
        status = "gray";
      }
      
      return {
        date: dateISO,
        dayLetter: "MTWTFSS"[i],
        status
      };
    });
  };

  const weekDays = generateWeekDays();

  // Calculate points needed for next rank
  const pointsForNextRank = nextRank ? nextRank.threshold - totalPoints : 0;

  return (
    <Box sx={{ p: 4, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Rank-up notification */}
      <Snackbar
        open={rankUpNotification}
        autoHideDuration={6000}
        onClose={handleRankNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleRankNotificationClose} 
          severity="success" 
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          Congratulations! You've ranked up to {newRankName}!
        </Alert>
      </Snackbar>

      {/* Rank-up animation overlay */}
      {showRankAnimation && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Zoom in={showRankAnimation}>
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '80%',
                textAlign: 'center',
              }}
            >
              {currentRank && (
                <Box sx={{ mb: 2, color: currentRank.color, fontSize: 60 }}>
                  {React.createElement(currentRank.icon, { fontSize: 'inherit' })}
                </Box>
              )}
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                NEW RANK ACHIEVED!
              </Typography>
              <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                {newRankName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Keep exploring to unlock new ranks and rewards!
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setShowRankAnimation(false)}
                sx={{ mt: 2 }}
              >
                Continue Adventure
              </Button>
            </Box>
          </Zoom>
        </Box>
      )}

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
              border: "1px solid #000", 
              borderRadius: "24px", 
              padding: "4px 16px", 
              ":hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)", 
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
            
            {/* Display current rank under name */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              {currentRank && (
                <>
                  {React.createElement(currentRank.icon, { 
                    sx: { 
                      color: currentRank.color, 
                      fontSize: 24, 
                      mr: 1 
                    } 
                  })}
                  <Typography 
                    variant="h6" 
                    fontWeight="medium" 
                    sx={{ color: currentRank.color }}
                  >
                    {currentRank.name}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Updated Streak Box Component with rank progress */}
          <Box
            sx={{
              backgroundColor: "#F0F0F0",
              borderRadius: 3,
              p: 3,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0px 2px 10px rgba(0,0,0,0.08)"
            }}
          >
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              mb: 2
            }}>
              {/* Left side - Fire icon with streak count */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocalFireDepartmentIcon 
                  sx={{ 
                    color: "#FF6B00", 
                    fontSize: 40,
                    mr: 1
                  }} 
                />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1 }}>
                    {currentStreak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                    day streak
                  </Typography>
                </Box>
              </Box>
              
              {/* Right side - Points with star in gold circle */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center",
                backgroundColor: "#FFF", 
                borderRadius: "20px",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                px: 2,
                py: 0.5
              }}>
                <Box sx={{ 
                  borderRadius: "50%",
                  backgroundColor: "#FFD700",
                  width: 26,
                  height: 26,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 1
                }}>
                  <StarIcon sx={{ color: "#FFF", fontSize: 16 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography fontWeight="medium">
                    {totalPoints} points
                  </Typography>
                  {/* Points needed for next rank */}
                  {nextRank && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {pointsForNextRank} more to {nextRank.name}!
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Login track circles */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              mt: 1.5
            }}>
              {weekDays.map((day, index) => (
                <Box key={index} sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center"
                }}>
                  {day.status === "checkmark" ? (
                    <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                  ) : day.status === "gray" ? (
                    <RadioButtonUncheckedIcon sx={{ color: "#9E9E9E", fontSize: 20 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: "#E0E0E0", fontSize: 20 }} />
                  )}
                  <Typography variant="caption" sx={{ fontSize: 12, mt: 0.5 }}>
                    {day.dayLetter}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            gap: 4,
            overflowX: "auto",
            px: 2,
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
            image="/balancequest.png"
          />
          </Grid2>
          <GameCard
            title="Beat Step"
            description="Train your rhythm and coordination with stepping challenges."
            bgColor="teal"
            image="/beatstep.png"
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
        background: gradientColors[bgColor] || gradientColors.orange,
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
            paddingBottom: 2,
            backgroundColor: "transparent",
          }}
        >
          <Box
            component="img"
            src={image}
            alt={`${title} image`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "scale-down",
              borderRadius: "5px",
            }}
          />
        </Box>
      )}
    </Card>
  );
};

export default Dashboard;