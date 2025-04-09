import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./game-1-instructions-pt3.css";

const Game1InstructionsPart3 = ({ onComplete, onBack }) => {
  const navigate = useNavigate();
  const { uid } = useParams();

  return (
    <div className="instructions-container">
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

      <div style={{ marginTop: '8rem', marginBottom: '4rem' }}>
        <h2 className="game-title">Game Instructions</h2>
        <p className="instruction-subtext">
          {/* Add your instruction text here */}
        </p>
      </div>

      <div className="instructions-visuals">
        {/* Add your static image here */}
        <img 
          src="/path-to-your-image.png" 
          alt="Instruction Image"
          className="instruction-image"
        />
      </div>

      <div 
        className="continue-button"
        onClick={onComplete}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FBAD84',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: '700',
          cursor: 'pointer',
          padding: '10px 20px',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        Click to continue
      </div>
    </div>
  );
};

export default Game1InstructionsPart3; 