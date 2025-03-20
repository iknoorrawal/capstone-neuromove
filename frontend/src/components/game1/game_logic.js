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
  Typography,
  Snackbar,
  Alert
} from "@mui/material";

import FinalScore from "./final_score";

function createSoundPool(url, poolSize = 3) {
  const sounds = Array(poolSize).fill().map(() => new Audio(url));
  let index = 0;
  
  return {
    preload: function() {
      // Preload all sounds in the pool
      sounds.forEach(sound => {
        sound.load();
        // Some browsers require interaction before playing
        // This trick helps with initial loading
        sound.volume = 0;
        sound.play().then(() => {
          sound.pause();
          sound.currentTime = 0;
          sound.volume = 1;
        }).catch(err => console.log("Preload attempted, will work after user interaction"));
      });
    },
    play: function() {
      const sound = sounds[index];
      sound.currentTime = 0;
      sound.play().catch(err => console.error("Error playing sound:", err));
      index = (index + 1) % poolSize;
    }
  };
}

// Create sound pools at the component level (outside any useEffect)
const correctSoundPool = createSoundPool("http://localhost:8000/sounds/correct.mp3");
const incorrectSoundPool = createSoundPool("http://localhost:8000/sounds/incorrect.mp3");

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

// Add these styles at the top of your component
const styles = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #FDE3C3 0%, #FFF2E5 100%)",
    position: "relative",
    overflow: "hidden"
  },
  instructionBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "16px",
    padding: "1.5rem 2.5rem",
    marginBottom: "2rem",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)"
    }
  },
  gameContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto"
  },
  emojiContainer: {
    position: "relative",
    width: "250px",
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: "24px",
    boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.12)",
    margin: "2rem 0",
    animation: "float 3s ease-in-out infinite"
  },
  scoreBox: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1rem 2rem",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
    marginTop: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem"
  },
  timerCircle: {
    position: "absolute",
    top: "-20px",
    right: "-20px",
    backgroundColor: "#A0522D",
    color: "white",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
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

  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const [sensorData, setSensorData] = useState({
    leftSensor: 0.00,
    rightSensor: 0.00,
    status: 'Disconnected'
  });

  // Add this state to track if we can accept new guesses
  const [canAcceptGuess, setCanAcceptGuess] = useState(true);

  // Add a new state to track if we're waiting for sensors to reset
  const [waitingForReset, setWaitingForReset] = useState(false);

  useEffect(() => {
      const interval = setInterval(() => {
          fetchSensorData();
      }, 10); 

      return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
      try {
          const response = await fetch('http://localhost:8000/sensor-data');
          const data = await response.json();
          console.log('Received data:', data); // Debug log

          setSensorData({
              leftSensor: data.left ?? 0.00,
              rightSensor: data.right ?? 0.00,
              status: data.connected ? 'Connected' : 'Disconnected'
          });
      } catch (error) {
          console.error('Error fetching sensor data:', error);
          setSensorData(prev => ({ ...prev, status: 'Error' }));
      }
  };

  const formatNumber = (num) => {
    return (typeof num === 'number' ? num : 0.00).toFixed(2);
  };  

  useEffect(() => {
    // Preload audio files
    correctSoundPool.preload();
    incorrectSoundPool.preload();
  }, []);
  
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
    const correctAnswer = currentEmoji.inGroup;
    const isCorrect = userSaysInCategory === correctAnswer;
    
    // Set feedback states
    setIsCorrectAnswer(isCorrect);
    setShowFeedback(true);
    
    if (isCorrect) {
      correctSoundPool.play();
      setScore((prev) => prev + 1);
    } else {
      incorrectSoundPool.play();
    }
    
    goToNextGuess();
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

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  // Update the sensor watching useEffect
  useEffect(() => {
    if (!done && !showInitial) {
      const leftSensorValue = formatNumber(sensorData.leftSensor);
      const rightSensorValue = formatNumber(sensorData.rightSensor);

      // If waiting for reset, check if both sensors are back to 0
      if (waitingForReset) {
        if (leftSensorValue === "0.00" && rightSensorValue === "0.00") {
          setWaitingForReset(false);
          setCanAcceptGuess(true);
        }
        return;
      }

      // Only process new guesses if we can accept them
      if (canAcceptGuess) {
        if (leftSensorValue >= 1.0) {
          setCanAcceptGuess(false);
          setWaitingForReset(true);
          handleGuess(true);
        }
        else if (rightSensorValue >= 1.0) {
          setCanAcceptGuess(false);
          setWaitingForReset(true);
          handleGuess(false);
        }
      }
    }
  }, [sensorData, canAcceptGuess, done, showInitial, waitingForReset]);

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

  return (
    <Box sx={styles.mainContainer}>
      {ExitButtonAndDialog}

      <Box sx={styles.gameContainer}>
        <Box sx={styles.instructionBox}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontWeight: 500,
              mb: 1
            }}
          >
            Balance on <span style={{ color: '#A0522D', fontWeight: 'bold' }}>left foot</span> for "In Category"
            <br />
            Balance on <span style={{ color: '#A0522D', fontWeight: 'bold' }}>right foot</span> for "Not In Category"
          </Typography>
        </Box>

        <Typography 
          variant="h3" 
          sx={{ 
            color: "#A0522D", 
            fontWeight: "bold",
            textAlign: "center",
            mb: 4,
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Is this in the category?
        </Typography>

        <Box sx={styles.emojiContainer}>
          <Box sx={styles.timerCircle}>
            {guessTimer}s
          </Box>
          <Typography sx={{ fontSize: "8rem" }}>
            {currentGuess.emoji}
          </Typography>
        </Box>

        <Box sx={styles.scoreBox}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#A0522D",
              fontWeight: "bold"
            }}
          >
            Score: <span style={{ color: '#4CAF50' }}>{score}</span> / {guessIndex}
          </Typography>
        </Box>
      </Box>

      {/* Add floating animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      <Snackbar
        open={showFeedback}
        autoHideDuration={1000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 6 }}
      >
        <Alert
          onClose={handleFeedbackClose}
          severity={isCorrectAnswer ? "success" : "error"}
          sx={{
            width: '100%',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            backgroundColor: isCorrectAnswer ? '#4CAF50' : '#f44336',
            color: 'white',
            py: 2,
            '& .MuiAlert-icon': {
              fontSize: '2.2rem'
            }
          }}
        >
          {isCorrectAnswer ? 'Correct!' : 'Incorrect'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BalanceQuest;
