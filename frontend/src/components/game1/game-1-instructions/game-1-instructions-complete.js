import React from "react";
import { useNavigate } from "react-router-dom";
import "./game-1-instructions-complete.css";

const Game1InstructionsComplete = ({ onRepeat, onPlay, uid, onRestart }) => {
  const navigate = useNavigate();
  

  const handleRepeat = () => {
    console.log("onRestart:", onRestart);
    onRestart();
  };

  return (
    <div className="instructions-complete-container">
      <h2 className="instructions-complete-text">
        You are all set. Are you ready to play?
      </h2>

      <div className="instructions-buttons">
        <button className="repeat-button" onClick={handleRepeat}>
          Repeat Instructions
        </button>
        <button className="play-button" onClick={onPlay}>
          Play Now
        </button>
      </div>
    </div>
  );
};

export default Game1InstructionsComplete;