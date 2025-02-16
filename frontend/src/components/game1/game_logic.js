import React, { useEffect, useState } from "react";
import axios from "axios";

function BalanceQuest() {
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);

  // First screen (category display)
  const [showInitial, setShowInitial] = useState(true);
  const [initialTimer, setInitialTimer] = useState(10); // 10 seconds

  // Guessing phase
  const [guessIndex, setGuessIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // 5-second timer for each guess
  const [guessTimer, setGuessTimer] = useState(5);

  // --------------------------------------------------
  // 1. Fetch data from the FastAPI backend
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 2. First screen: 10-second timer
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 3. Guessing phase: 5-second countdown
  // --------------------------------------------------
  useEffect(() => {
    if (gameData && !showInitial && !done) {
      // Reset to 5 seconds each time a new guess starts
      setGuessTimer(5);

      const interval = setInterval(() => {
        setGuessTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            // Time ran out -> automatically move on (incorrect guess)
            goToNextGuess();
            return 0;
          }
        });
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

  // --------------------------------------------------
  // 4. Handle user's guess
  // --------------------------------------------------
  const handleGuess = (userSaysInCategory) => {
    if (!gameData || done) return;

    const currentEmoji = gameData.guessEmojis[guessIndex];
    // Compare user guess to inGroup
    const correctAnswer = currentEmoji.inGroup; 
    if (userSaysInCategory === correctAnswer) {
      setScore((prev) => prev + 1);
    }
    goToNextGuess();
  };

  // --------------------------------------------------
  // Rendering
  // --------------------------------------------------
  if (error) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Error: {error}</div>;
  }
  if (!gameData) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  // Final screen
  if (done) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
        <h1>Game Over!</h1>
        <p>You got <strong>{score}</strong> correct out of {gameData.guessEmojis.length}.</p>
      </div>
    );
  }

  // First screen: show category emojis for 10 seconds
  if (showInitial) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
        <h1 style={{ marginBottom: "20px", color: "#A0522D" }}>
          The following items belong<br/>to one category.
        </h1>

        <div style={{ fontSize: "8rem", margin: "40px 0" }}>
          {gameData.initialEmojis.map((item, idx) => (
            <span key={idx} style={{ margin: "0 25px" }}>
              {item.emoji}
            </span>
          ))}
        </div>

        <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
          {initialTimer} second{initialTimer > 1 ? "s" : ""} remaining...
        </p>
      </div>
    );
  }

  // Second screen: Guessing phase
  const currentGuess = gameData.guessEmojis[guessIndex];

  const radius = 70; 
  const circumference = 2 * Math.PI * radius; 
  const fraction = guessTimer / 5; 
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#A0522D" }}>Select the correct answer</h1>

      <div style={{ position: "relative", width: "150px", height: "150px", margin: "40px auto" }}>
        {/* Circular SVG countdown (brown stroke) */}
        <svg
          width="150"
          height="150"
        >
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

      {/* Buttons */}
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

      {/* Score / Progress */}
      <p style={{ marginTop: "30px", fontSize: "1.1rem" }}>
        Score: {score} / {guessIndex} &nbsp;|&nbsp; Time left: {guessTimer}s
      </p>
    </div>
  );
}

export default BalanceQuest;
