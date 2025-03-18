import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography
} from "@mui/material";

import FinalScore from "./final_score";

const LEVEL_CONFIG = {
  1: {
    items: 10,
    memorizeTime: 10,
    guessTime: 15
  },
  2: {
    items: 12,
    memorizeTime: 10,
    guessTime: 10
  },
  3: {
    items: 15,
    memorizeTime: 10,
    guessTime: 5
  }
};

function BalanceQuest() {
  const { uid, level: levelParam } = useParams();
  const level = parseInt(levelParam) || 1;
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);
  const [gameId] = useState(uuidv4());

  const [showInitial, setShowInitial] = useState(true);
  const [initialTimer, setInitialTimer] = useState(config.memorizeTime);

  const [guessIndex, setGuessIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const [guessTimer, setGuessTimer] = useState(config.guessTime);
  const [dataSaved, setDataSaved] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [sensorData, setSensorData] = useState({ left: 0, right: 0 });
  const [lastSensorState, setLastSensorState] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/game?level=${level}`);
        setGameData(response.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchGameData();
  }, [level]);


  useEffect(() => {
    if (gameData && showInitial) {
      const interval = setInterval(() => {
        setInitialTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            setShowInitial(false);
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameData, showInitial]);


  useEffect(() => {
    if (gameData && !showInitial && !done) {
      setGuessTimer(config.guessTime);

      const interval = setInterval(() => {
        setGuessTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            goToNextGuess();
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [guessIndex, showInitial, done, gameData, config.guessTime]);

  useEffect(() => {
    if (!showInitial && !done) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/sensor-data');
          const data = await response.json();
          setSensorData(data);

          if (data.left === 1 && lastSensorState.left === 0) {
            handleGuess(true);
          } else if (data.right === 1 && lastSensorState.right === 0) {
            handleGuess(false);
          }

          setLastSensorState(data);
        } catch (error) {
          console.error('Error fetching sensor data:', error);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [showInitial, done, lastSensorState, guessIndex]);

  const goToNextGuess = () => {
    if (!gameData) return;
    if (guessIndex + 1 < gameData.guessEmojis.length) {
      setGuessIndex(guessIndex + 1);
    } else {
      setDone(true);
    }
  };


  const handleGuess = (userSaysInCategory) => {
    if (!gameData || done) return;

    const currentEmoji = gameData.guessEmojis[guessIndex];
    if (!currentEmoji) {
      setDone(true);
      return;
    }

    const correctAnswer = currentEmoji.inGroup;
    if (userSaysInCategory === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    // Reset last sensor state to prevent multiple triggers
    setLastSensorState({ left: 0, right: 0 });

    // Move to next guess
    if (guessIndex + 1 < gameData.guessEmojis.length) {
      setGuessIndex((prev) => prev + 1);
      setGuessTimer(config.guessTime);
    } else {
      setDone(true);
    }
  };
  
    useEffect(() => {
    if (done && !dataSaved && gameData) {
      const docRef = doc(db, `users/${uid}/game1/${gameId}`);

      setDoc(docRef, {
        guessEmojis: gameData.guessEmojis,
        correct_count: score, 
        incorrect_count: gameData.guessEmojis.length-score,
        initalCategory: gameData.initialEmojis,
        timestamp: Timestamp.now(),
        level: level
      })
        .then(() => {
          console.log("Game result saved to Firebase!");
        })
        .catch((err) => {
          console.error("Error saving to Firebase:", err);
        })
        .finally(() => {
          setDataSaved(true);
        });
    }
  }, [done, dataSaved, uid, gameData, score, level]);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmExit = () => {
    setOpenConfirm(false);
    navigate(`/balance-quest/${uid}/home-page`);
  };

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Error: {error}
      </div>
    );
  }

  if (!gameData) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  // Final screen
  if (done) {
    return (
      <FinalScore
        score={score}
        total={gameData.guessEmojis.length}
        uid={uid}
        gameId={gameId}
        level={level}
      />
    );
  }

  const ExitButtonAndDialog = (
    <>
      {/* Exit button in top-left corner */}
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Button
          variant="outlined"
          sx={{ borderColor: "#A0522D", color: "#A0522D" }}
          onClick={handleOpenConfirm}
        >
          Exit Game
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Are you sure you want to exit?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>No</Button>
          <Button onClick={handleConfirmExit} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // -- 7. First screen: show category emojis --
  if (showInitial) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 4,
          background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)",
          position: "relative",
          textAlign: "center"
        }}
      >
        {ExitButtonAndDialog}

        <Typography variant="h3" sx={{ mb: 4, color: "#A0522D", fontWeight: "bold" }}>
          The following items belong
          <br />
          to one category
        </Typography>

        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 4, 
          my: 6,
          fontSize: "8rem"
        }}>
          {gameData.initialEmojis.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                width: "150px",
                height: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span>{item.emoji}</span>
            </Box>
          ))}
        </Box>

        <Typography variant="h5" sx={{ color: "#A0522D" }}>
          {initialTimer} second{initialTimer > 1 ? "s" : ""} remaining...
        </Typography>
      </Box>
    );
  }

  const currentGuess = gameData.guessEmojis[guessIndex];
  if (!currentGuess) {
    setDone(true);
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: 4,
        background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)",
        position: "relative"
      }}
    >
      {ExitButtonAndDialog}

      <Typography variant="h3" sx={{ mb: 6, color: "#A0522D", fontWeight: "bold" }}>
        Select the correct answer
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "200px",
          height: "200px",
          mb: 4
        }}
      >
        {/* Circular SVG countdown */}
        <svg width="200" height="200">
          <circle
            cx="100"
            cy="100"
            r={90}
            fill="none"
            stroke="#A0522D"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - guessTimer / config.guessTime)}
            strokeLinecap="round"
          />
        </svg>

        {/* Emoji Container - Only show the emoji */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "140px",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6rem",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          {currentGuess.emoji}
        </Box>
      </Box>

      {/* Sensor Indicators */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        width: '100%',
        maxWidth: '600px',
        mb: 4 
      }}>
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: sensorData.left ? '#A0522D' : 'rgba(160, 82, 45, 0.1)',
          color: sensorData.left ? 'white' : '#A0522D',
          transition: 'all 0.3s ease',
          textAlign: 'center'
        }}>
          <Typography variant="h6">
            Left Sensor
          </Typography>
          <Typography>
            (In Category)
          </Typography>
        </Box>

        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: sensorData.right ? '#A0522D' : 'rgba(160, 82, 45, 0.1)',
          color: sensorData.right ? 'white' : '#A0522D',
          transition: 'all 0.3s ease',
          textAlign: 'center'
        }}>
          <Typography variant="h6">
            Right Sensor
          </Typography>
          <Typography>
            (Not In Category)
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px 24px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6" sx={{ color: "#A0522D" }}>
          Score: {score} / {guessIndex} &nbsp;|&nbsp; Time left: {guessTimer}s
        </Typography>
      </Box>
    </Box>
  );
}

export default BalanceQuest;