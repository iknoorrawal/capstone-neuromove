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
  DialogTitle
} from "@mui/material";

import FinalScore from "./final_score";

function BalanceQuest() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState(null);
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


  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/game");
        setGameData(response.data);
      } catch (err) {
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
        }, 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [guessIndex, showInitial, done, gameData]);

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
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {ExitButtonAndDialog}

      <h1 style={{ color: "#A0522D" }}>Select the correct answer</h1>

      <div
        style={{
          position: "relative",
          width: "150px",
          height: "150px",
          margin: "40px auto",
        }}
      >
        {/* Circular SVG countdown (brown stroke) */}
        <svg width="150" height="150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#A0522D"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center the emoji absolutely on top of the SVG */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "150px",
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "5rem",
          }}
        >
          {currentGuess.emoji}
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => handleGuess(true)}
          style={{
            fontSize: "1.2rem",
            marginRight: "40px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          In Category
        </button>

        <button
          onClick={() => handleGuess(false)}
          style={{
            fontSize: "1.2rem",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Not In Category
        </button>
      </div>

      <p style={{ marginTop: "30px", fontSize: "1.1rem" }}>
        Score: {score} / {guessIndex} &nbsp;|&nbsp; Time left: {guessTimer}s
      </p>
    </div>
  );
}

export default BalanceQuest;
