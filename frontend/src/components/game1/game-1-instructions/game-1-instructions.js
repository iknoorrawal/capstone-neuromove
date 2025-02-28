import React, { useState, useEffect } from "react";
import "./game-1-instructions.css";
import Game1InstructionsPart2 from "./game-1-instructions-pt2";
import Game1InstructionsComplete from "./game-1-instructions-complete";

const fruits = [
  { id: 1, name: "mango", src: "/mango.png" },
  { id: 2, name: "watermelon", src: "/watermelon.png" },
  { id: 3, name: "banana", src: "/banana.png" },
];

const Game1Instructions = ({ onComplete, onBack }) => {
  const [showPart2, setShowPart2] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [droppedFruits, setDroppedFruits] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Key to force re-render

  // Reset all state variables to initial values
  const handleRepeat = () => {
    console.log("Repeat button clicked!"); // Debugging log
    setShowPart2(false);
    setShowComplete(false);
    setCurrentFruitIndex(0);
    setDroppedFruits([]);
    setResetKey((prevKey) => prevKey + 1); // Force re-render
  };

  // Handle fruit drop animation
  useEffect(() => {
    if (currentFruitIndex < fruits.length) {
      const timer = setTimeout(() => {
        setDroppedFruits((prev) => [...prev, fruits[currentFruitIndex].id]);
        setCurrentFruitIndex((prevIndex) => prevIndex + 1);
      }, 3000); // Delay each fruit drop by 3 seconds
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowPart2(true), 2000); // Proceed to part 2 after all fruits drop
    }
  }, [currentFruitIndex]);

  return (
    <div key={resetKey}> {/* Force re-render when resetKey changes */}
      {showComplete ? (
        <Game1InstructionsComplete
          onRepeat={handleRepeat} // Pass handleRepeat to the complete screen
          onPlay={onComplete}
        />
      ) : showPart2 ? (
        <Game1InstructionsPart2
          onComplete={() => setShowComplete(true)}
          onBack={onBack}
        />
      ) : (
        <div className="instructions-container">
          <button className="back-button" onClick={onBack}>
            <img src="/arrow-back.png" alt="Back" className="back-arrow" />
          </button>
          <h2 className="game-title">Game Instructions</h2>
          <p className="instruction-subtext">The following items belong to one category.</p>
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
          <img className="bucket" src="/bucket.png" alt="Bucket" />
          <button className="next-button" onClick={() => setShowPart2(true)}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Game1Instructions;