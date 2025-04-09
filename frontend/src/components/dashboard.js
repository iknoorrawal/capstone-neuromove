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
  Snackbar,
  Alert,
  Zoom,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
// Import rank icons
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import TerrainIcon from '@mui/icons-material/Terrain';
import RouteIcon from '@mui/icons-material/Route';
import { updateStreakAndActivity } from "./updateStreakAndActivity.js";
 
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

// Function to check if a streak is a milestone (multiple of 50)
const isStreakMilestone = (streak) => {
  return streak > 0 && streak % 50 === 0;
};

// Function to award bonus points for streak milestones
const awardStreakMilestoneBonus = async (uid, streak, currentPoints) => {
  const MILESTONE_BONUS = 500;
  
  if (isStreakMilestone(streak)) {
    // Add bonus points
    const newTotalPoints = currentPoints + MILESTONE_BONUS;
    
    // Update user's points in Firestore
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      totalPoints: newTotalPoints,
      lastMilestoneStreak: streak, // Keep track of the last milestone streak
    });
    
    return {
      awardedBonus: true,
      newTotalPoints,
      bonusAmount: MILESTONE_BONUS
    };
  }
  
  return {
    awardedBonus: false,
    newTotalPoints: currentPoints,
    bonusAmount: 0
  };
};

const Dashboard = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  
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
  // State for milestone bonus notification
  const [milestoneNotification, setMilestoneNotification] = useState(false);
  const [milestoneBonus, setMilestoneBonus] = useState(0);

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

          // Set the streak and weekly login data
          setWeeklyLogins(userData.weeklyLogins || {});
          setCurrentStreak(userData.currentStreak || 0);
          setTotalPoints(userData.totalPoints || 0);
          
          // Calculate user's rank based on points
          const rankObj = getUserRank(userData.totalPoints || 0);
          setCurrentRank(rankObj);

          // Determine next rank
          const nextRankObj = getNextRank(rankObj);
          setNextRank(nextRankObj);
          
          // Check for streak milestone and award bonus if needed
          if (isStreakMilestone(userData.currentStreak) && 
              (!userData.lastMilestoneStreak || userData.lastMilestoneStreak !== userData.currentStreak)) {
            
            const result = await awardStreakMilestoneBonus(
              uid, 
              userData.currentStreak, 
              userData.totalPoints || 0
            );
            
            if (result.awardedBonus) {
              // Update points in local state
              setTotalPoints(result.newTotalPoints);
              
              // Show milestone notification
              setMilestoneBonus(result.bonusAmount);
              setMilestoneNotification(true);
              
              // Check if new points qualify for rank up
              const newRankObj = getUserRank(result.newTotalPoints);
              if (newRankObj.name !== rankObj.name) {
                // User ranked up due to milestone bonus!
                setCurrentRank(newRankObj);
                setNextRank(getNextRank(newRankObj));
                setNewRankName(newRankObj.name);
                setRankUpNotification(true);
                
                // Show rank-up animation after a short delay
                setTimeout(() => {
                  setShowRankAnimation(true);
                }, 1000);
              }
            }
          }
          
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
  
  const handleRankNotificationClose = () => {
    setRankUpNotification(false);
  };
  
  const handleMilestoneNotificationClose = () => {
    setMilestoneNotification(false);
  };

  // Generate the array of days for the current week (Monday to Sunday)
  const generateWeekDays = () => {
    if (!weeklyLogins.weekStartDate) {
      // If no week start date is set, create default week days
      const today = new Date();
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Make Monday the first day
      
      return Array(7).fill().map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateISO = date.toISOString().split('T')[0];
        
        return {
          date: dateISO,
          dayLetter: "MTWTFSS"[i],
          status: "blank"
        };
      });
    }

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

  const weekDays = generateWeekDays();
  
  // Calculate points needed for next rank
  const pointsForNextRank = nextRank ? nextRank.threshold - totalPoints : 0;

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
      {/* Milestone bonus notification */}
      <Snackbar
        open={milestoneNotification}
        autoHideDuration={6000}
        onClose={handleMilestoneNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 2 }}
      >
        <Alert 
          onClose={handleMilestoneNotificationClose} 
          severity="success" 
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          🔥 Streak Milestone Achieved! Bonus +{milestoneBonus} points added!
        </Alert>
      </Snackbar>
      
      {/* Rank-up notification */}
      <Snackbar
        open={rankUpNotification}
        autoHideDuration={6000}
        onClose={handleRankNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: milestoneNotification ? 8 : 2 }}
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
              {userData?.firstName}!
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

          {/* Stats Box */}
          <Box sx={{
            bgcolor: "#F8F9FA",
            borderRadius: 4,
            p: 3,
            minWidth: 625,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0px 2px 10px rgba(0,0,0,0.08)"
          }}>
            {/* Streaks with enhanced UI */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center"
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
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Streaks
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1 }}>
                    {currentStreak}
                  </Typography>
                  {/* Show mini message for milestone streaks */}
                  {isStreakMilestone(currentStreak) && (
                    <Typography variant="caption" sx={{ color: "#FF6B00", fontWeight: "bold" }}>
                      🏆 Milestone reached!
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Right side - Points with star icon */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center"
              }}>
                <StarIcon sx={{ color: '#FFD700', mr: 1 }} />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {totalPoints} points
                  </Typography>
                  {/* Points needed for next rank */}
                  {nextRank && (
                    <Typography variant="body2" color="text.secondary">
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