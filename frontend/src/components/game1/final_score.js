import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
} from "@mui/material";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

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

function FinalScore({ score, total, uid, gameId }) {
  const incorrectCount = total - score;
  const { stars, points } = getStarsAndPoints(score, total);

  const navigate = useNavigate();

  const handlePlayAgain = () => {
    navigate(`/balance-quest/${uid}/home-page`);
  };

  const handleExit = () => {
    navigate(`/dashboard/${uid}`);
  };

  useEffect(() => {
      const docRef = doc(db, `users/${uid}/game1/${gameId}`);

      updateDoc(docRef, {
        score: points,
      })
        .then(() => {
          console.log("Game result saved to Firebase!");
        })
        .catch((err) => {
          console.error("Error saving to Firebase:", err);
        })
  }, [points]);

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        padding: "40px",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)"
      }}
    >

      <h2 style={{ color: "#A0522D", marginTop: 0 }}>FINAL SCORE</h2>

      {renderStars(stars, 5)}

      <p style={{ fontSize: "1.1rem", color: "#777" }}>
        {score} CORRECT &nbsp;•&nbsp; {incorrectCount} INCORRECT
      </p>

      <p style={{ fontSize: "1.4rem", color: "#000", fontWeight: "bold" }}>
        +{points} Points
      </p>

      <div style={{ marginTop: "40px" }}>
        <Button
          variant="outlined"
          onClick={handleExit}
          sx={{
            marginRight: "20px",
            padding: "10px 3rem",
            borderColor: "#A0522D",
            color: "#A0522D"
          }}
        >
          Exit Game
        </Button>

        <Button
          variant="contained"
          onClick={handlePlayAgain}
          sx={{
            backgroundColor: "#A0522D",
            color: "#fff",
            padding: "10px 3rem",
            "&:hover": {
              backgroundColor: "#8B4513"
            }
          }}
        >
          Play Again
        </Button>
      </div>
    </div>
  );
}

export default FinalScore;
