import React from "react";
import { useNavigate } from "react-router-dom";
import "./game-1-instructions-complete.css";

const Game1InstructionsComplete = ({ onBack, onPlay, onRestart, uid, level }) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate(`/balance-quest/${uid}/game/level/${level}`);
  };
  

  const handleRepeat = () => {
    // Navigate back to first instruction screen
    onRestart();
  };

  return (
    <div className="instructions-complete-container">
      <button 
        className="exit-button"
        onClick={() => navigate(`/balance-quest/${uid}/home-page`)}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          border: '2px solid #B45522',
          color: '#B45522',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        Exit Game
      </button>

      <h2 className="instructions-complete-text">
        You are all set. Are you ready to play?
      </h2>

      <div className="instructions-buttons">
        <button className="repeat-button" onClick={onRestart}>
          Repeat Instructions
        </button>
        <button className="play-button" onClick={handlePlay}>
          Play Now
        </button>
      </div>
    </div>
  );
};

export default Game1InstructionsComplete;