import React, { useState, useEffect } from "react";
import "./game-1-instructions.css";
import Game1InstructionsPart2 from "./game-1-instructions-pt2";
import Game1InstructionsComplete from "./game-1-instructions-complete";
import { useNavigate, useParams } from "react-router-dom";
import "./bucket.css";

const fruits = [
  { id: 1, name: "mango", src: "/mango.png" },
  { id: 2, name: "watermelon", src: "/watermelon.png" },
  { id: 3, name: "banana", src: "/banana.png" },
];

const Game1Instructions = ({ onComplete, onBack }) => {
  const navigate = useNavigate();
  const { uid, level } = useParams(); // Get both uid and level from URL params
  const [showPart2, setShowPart2] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [droppedFruits, setDroppedFruits] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Key to force re-render
  const [showContinueText, setShowContinueText] = useState(false);

  // Reset all state variables to initial values
  const handleRepeat = () => {
    console.log("Repeat button clicked!"); // Debugging log
    setShowPart2(false);
    setShowComplete(false);
    setCurrentFruitIndex(0);
    setDroppedFruits([]);
    setResetKey((prevKey) => prevKey + 1); // Force re-render
  };

  // Add console log to debug
  useEffect(() => {
    console.log("Current fruit index:", currentFruitIndex);
    console.log("Fruits length:", fruits.length);
    console.log("Should show text:", currentFruitIndex >= fruits.length);
  }, [currentFruitIndex]);

  // Handle fruit drop animation
  useEffect(() => {
    if (currentFruitIndex < fruits.length) {
      const timer = setTimeout(() => {
        setDroppedFruits((prev) => [...prev, fruits[currentFruitIndex].id]);
        setCurrentFruitIndex((prevIndex) => prevIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Set showContinueText to true after all fruits have dropped
      setShowContinueText(true);
    }
  }, [currentFruitIndex]);

  // Add click handler for the first screen
  const handleFirstScreenClick = () => {
    setShowPart2(true);
  };

  const handleSkip = () => {
    // Set all fruits as dropped and move to next step
    setDroppedFruits(fruits.map(fruit => fruit.id));
    setCurrentFruitIndex(fruits.length);
  };

  return (
    <div key={resetKey}>
      {showComplete ? (
        <Game1InstructionsComplete
          onRepeat={handleRepeat}
          onPlay={onComplete}
          uid={uid}
          level={level}
        />
      ) : showPart2 ? (
        <Game1InstructionsPart2
          onComplete={() => setShowComplete(true)}
          onBack={onBack}
          onRestart={handleRepeat}
          level={level}
        />
      ) : (
        <div 
          className="instructions-container" 
          onClick={handleFirstScreenClick}
          style={{ 
            padding: '5rem 2rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            height: '100vh'
          }}
        >
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginTop: '8rem' }}>
              <h2 className="game-title">Game Instructions</h2>
              <p className="instruction-subtext">
                You will be given a series of items in a category <br /> For example, here the category is "fruits"
              </p>
            </div>
            
            <div className="fruits-container">
              {fruits.map((fruit, index) => (
                <div key={fruit.id} className="fruit-wrapper">
                  <img
                    src={fruit.src}
                    alt={fruit.name}
                    className={`fruit ${droppedFruits.includes(fruit.id) ? "falling" : ""} fruit-${index}`}
                  />
                </div>
              ))}

            </div>

            
          </div>

          <div 
            className="correct-bin"
            style={{
         
     position: 'fixed',
              bottom: '0rem',
              left: "50%",
              transform: "translateX(-50%)"
            }}
          >
            CORRECT
          </div>

          <div 
            className="continue-button"
            onClick={handleFirstScreenClick}
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
              zIndex: 10
            }}
          >
            Click to continue
          </div>
        </div>
      )}
    </div>
  );
};

export default Game1Instructions;