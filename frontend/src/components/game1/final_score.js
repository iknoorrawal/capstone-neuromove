import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Container,
  Paper
} from "@mui/material";
import { db } from "../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import updateStreakAndActivity from "../updateStreakAndActivity";

function getStarsAndPoints(score, total) {
  if (total === 0) return { stars: 0, points: 0 };

  const percentage = (score / total) * 100;

  if (percentage > 80) {
    return { stars: 5, points: 500 };
  } else if (percentage > 60) {
    return { stars: 4, points: 400 };
  } else if (percentage > 40) {
    return { stars: 3, points: 300 };
  } else if (percentage > 20) {
    return { stars: 2, points: 200 };
  } else {
    return { stars: 1, points: 100 };
  }
}

function renderStars(numStars, totalStars = 5) {
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    const color = i <= numStars ? "#FFA800" : "#ccc";
    stars.push(
      <span
        key={i}
        style={{
          fontSize: "3rem",
          color: color,
          margin: "0 8px"
        }}
      >
        ★
      </span>
    );
  }
  return <div style={{ margin: "20px 0" }}>{stars}</div>;
}

function FinalScore({ score, total, uid, gameId, level }) {
  const incorrectCount = total - score;
  const { stars, points } = getStarsAndPoints(score, total);
  console.log('Final Score Debug:', { score, total, incorrectCount, stars, points, level });

  const navigate = useNavigate();

  const handlePlayAgain = () => {
    navigate(`/balance-quest/${uid}/home-page`);
  };

  const handleExit = () => {
    navigate(`/balance-quest/${uid}/home-page`);
  };

  useEffect(() => {
    const updateFirebase = async () => {
      try {
        // Update game score
        const gameRef = doc(db, `users/${uid}/game1/${gameId}`);
        await updateDoc(gameRef, {
          score: points,
        });

        // Update streak and activity with the points earned
        const streakResult = await updateStreakAndActivity(db, uid, points);
        console.log('Streak update result:', streakResult);

        // If perfect score, unlock next level
        if (score === total) {
          const userRef = doc(db, "users", uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const currentData = userDoc.data();
            const currentUnlockedLevels = currentData.unlockedLevels || [1];
            
            // Only try to unlock next level if we're not at the last level
            if (level < 3) {
              const nextLevel = level + 1;
              
              // If next level isn't already unlocked
              if (!currentUnlockedLevels.includes(nextLevel)) {
                const newUnlockedLevels = [...currentUnlockedLevels, nextLevel];
                await updateDoc(userRef, {
                  unlockedLevels: newUnlockedLevels
                });
                console.log(`Unlocked level ${nextLevel}`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error updating Firebase:", err);
      }
    };

    updateFirebase();
  }, [score, total, points, uid, gameId, level]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)"
          }}
        >
          <Typography variant="h3" sx={{ color: "#A0522D", fontWeight: "bold", mb: 4 }}>
            FINAL SCORE
          </Typography>

          {renderStars(stars, 5)}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
              {score} CORRECT &nbsp;•&nbsp; {incorrectCount} INCORRECT
            </Typography>

            <Typography variant="h4" sx={{ color: "#A0522D", fontWeight: "bold" }}>
              +{points} Points
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={handleExit}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: "#A0522D",
                color: "#A0522D",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#8B4513",
                  backgroundColor: "rgba(160, 82, 45, 0.1)"
                }
              }}
            >
              Exit Game
            </Button>

            <Button
              variant="contained"
              onClick={handlePlayAgain}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: "#A0522D",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#8B4513"
                }
              }}
            >
              Play Again
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default FinalScore;
