import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

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
  CircularProgress
} from "@mui/material";

import FinalScore from "./final_score";

function BalanceQuest() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState({
    guessEmojis: [],
    initialEmojis: []
  });
  const [error, setError] = useState(null);
  const [gameId] = useState(uuidv4());

  const [showInitial, setShowInitial] = useState(true);
  const [initialTimer, setInitialTimer] = useState(10); // 10 seconds

  const [guessIndex, setGuessIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const [guessTimer, setGuessTimer] = useState(5);
  const [dataSaved, setDataSaved] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  
  // Arduino WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [forceData, setForceData] = useState({ 
    left: 0, 
    right: 0,
    left_pressed: false,
    right_pressed: false 
  });
  const [lastPress, setLastPress] = useState(null);
  const socketRef = useRef(null);
  const cooldownRef = useRef(false);
  
  // Connect to the WebSocket server
  useEffect(() => {
    // Create socket connection
    const socket = io('http://localhost:8000', {
        transports: ['polling', 'websocket']
    });

    // Connection opened
    socket.on('connect', () => {
        console.log('Connected!');
        setIsConnected(true);
    });

    // Connection closed
    socket.on('disconnect', () => {
        console.log('Disconnected!');
        setIsConnected(false);
    });

    // Test message
    socket.on('test', (data) => {
        console.log('Received test message:', data);
    });

    socket.on('force_data', (data) => {
        console.log('Received force data:', data);
        setForceData(prev => ({
            ...prev,
            left: data.left,
            right: data.right,
            left_pressed: data.left > 0.5,
            right_pressed: data.right > 0.5
        }));
    });

    // Cleanup on unmount
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/game");
        if (response.data) {
          setGameData(response.data);
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError(err.message);
      }
    };
    fetchGameData();
  }, []);

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
      setGuessTimer(5);

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
  }, [guessIndex, showInitial, done, gameData]);

  const goToNextGuess = () => {
    if (!gameData.guessEmojis?.length) return;
    if (guessIndex + 1 < gameData.guessEmojis.length) {
      setGuessIndex(guessIndex + 1);
    } else {
      setDone(true);
    }
  };

  const handleGuess = (userSaysInCategory) => {
    if (!gameData.guessEmojis?.length || done) return;

    const currentEmoji = gameData.guessEmojis[guessIndex];
    const correctAnswer = currentEmoji.inGroup;
    if (userSaysInCategory === correctAnswer) {
      setScore((prev) => prev + 1);
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
        timestamp: Timestamp.now()
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
  }, [done, dataSaved, uid, gameData, score]);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmExit = () => {
    setOpenConfirm(false);
    // Navigate away, e.g. to the same "home-page" or to the dashboard
    navigate(`/balance-quest/${uid}/home-page`);
  };

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Error: {error}
      </div>
    );
  }

  if (!gameData.guessEmojis.length) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <CircularProgress />
      </Box>
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
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          fontFamily: "sans-serif",
          position: "relative", // allows the absolutely positioned button
        }}
      >
        {ExitButtonAndDialog}

        <h1 style={{ marginBottom: "20px", color: "#A0522D" }}>
          The following items belong
          <br />
          to one category.
        </h1>

        <div style={{ fontSize: "8rem", margin: "40px 0" }}>
          {gameData.initialEmojis.map((item, idx) => (
            <span key={idx} style={{ margin: "0 25px" }}>
              {item.emoji}
            </span>
          ))}
        </div>

        <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
          {initialTimer} second
          {initialTimer > 1 ? "s" : ""} remaining...
        </p>
      </div>
    );
  }

  const currentGuess = gameData.guessEmojis[guessIndex];

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const fraction = guessTimer / 5;
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f5f5f5'
    }}>
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        padding: 3,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <Typography variant="h6" gutterBottom>
            Force Sensor Debug
        </Typography>
        <Typography>
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Typography>
        <Typography>
            Left Pressed: {forceData.left_pressed ? '✅' : '❌'}
        </Typography>
        <Typography>
            Right Pressed: {forceData.right_pressed ? '✅' : '❌'}
        </Typography>
      </Box>
    </Box>
  );
}

export default BalanceQuest;