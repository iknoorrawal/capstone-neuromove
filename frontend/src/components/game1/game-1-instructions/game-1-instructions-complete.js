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
      <div className="top-left-decoration">
        <svg width="1230" height="408" viewBox="0 0 1230 408" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M401 97.9999C453.158 125.354 573.511 186.736 722 108C862.5 33.5 1090.33 -0.000103763 1230 -9.15527e-05L708 -0.00010667L2.00004 -0.00016839C0.895421 -0.000168487 3.55902e-05 0.895248 3.54937e-05 1.99983L1.74845e-07 406C7.82804e-08 407.104 0.931885 408.002 2.03625 407.981C103.13 406.073 126.885 262.198 131.63 220.354C142.5 124.5 260.051 24.079 401 97.9999Z" fill="url(#paint0_linear_758_290)"/>
          <defs>
            <linearGradient id="paint0_linear_758_290" x1="248.5" y1="-117.5" x2="494.5" y2="327.5" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ECB24F" stop-opacity="0.6"/>
              <stop offset="1" stop-color="#ECB24F" stop-opacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="bottom-right-decoration">
        <svg width="1230" height="408" viewBox="0 0 1230 408" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M829 310C776.842 282.646 656.489 221.264 508 300C367.5 374.5 139.667 408 0 408L522 408L1228 408C1229.1 408 1230 407.105 1230 406V1.99999C1230 0.895425 1229.07 -0.00168896 1227.96 0.0191493C1126.87 1.92667 1103.11 145.802 1098.37 187.646C1087.5 283.5 969.949 383.921 829 310Z" fill="url(#paint0_linear_758_291)"/>
          <defs>
            <linearGradient id="paint0_linear_758_291" x1="981.5" y1="525.5" x2="735.5" y2="80.4999" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ECB24F" stop-opacity="0.6"/>
              <stop offset="1" stop-color="#ECB24F" stop-opacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

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
          fontWeight: 'bold',
          zIndex: 10
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