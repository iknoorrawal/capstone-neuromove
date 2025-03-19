import React, { useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Game1Instructions.css"; 
import { useNavigate, useParams } from "react-router-dom";

const fruits = [
  { id: 2, name: "banana", src: "/banana.png" },      // Left position
  { id: 1, name: "mango", src: "/mango.png" },        // Center position
  { id: 3, name: "watermelon", src: "/watermelon.png" } // Right position
];

const Game1Instructions = ({ onComplete, onBack }) => {
  const navigate = useNavigate();
  const { uid, level } = useParams(); // Get user ID from URL parameters
  
  // Part 1 state
  const [showPart2, setShowPart2] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [currentFruitIndex, setCurrentFruitIndex] = useState(0);
  const [droppedFruits, setDroppedFruits] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Key to force re-render
  
  // Part 2 state
  const [currentStep, setCurrentStep] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [highlightedBin, setHighlightedBin] = useState(null); // 'correct' or 'incorrect'

  // Part 2 steps
  const part2Steps = [
    { text: "Similar items go in the green bin.", item: null, correctBin: null },
    { text: "Balance on your left foot to select the green bin.", item: "/pineapple.png", correctBin: "green" },
    { text: "Balance on your right foot to select the red bin.", item: "/car.png", correctBin: "garbage" },
  ];

  // Skip to next step in Part 1
  const handlePart1Skip = () => {
    // Skip to the end of Part 1 to move to Part 2
    setCurrentFruitIndex(fruits.length);
    setDroppedFruits(fruits.map(fruit => fruit.id)); // Mark all fruits as dropped
    setShowPart2(true);
  };

  // Skip to next step in Part 2
  const handlePart2Skip = () => {
    if (currentStep < part2Steps.length - 1) {
      // Move to next step in Part 2
      setCurrentStep(currentStep + 1);
      setSelectedBin(null);
      setShowTimer(false);
      setIsTimerRunning(false);
      setHighlightedBin(null);
    } else {
      // If at last step, move to complete screen
      setShowComplete(true);
    }
  };

  // Reset all state variables to initial values
  const handleRepeat = () => {
    console.log("handleRepeat called");
    // Reset all state in one go to ensure consistency
    setShowPart2(false);
    setShowComplete(false);
    setCurrentFruitIndex(0);
    setDroppedFruits([]);
    setCurrentStep(0);
    setShowTimer(false);
    setIsTimerRunning(false);
    setHighlightedBin(null);
    setSelectedBin(null);
    setResetKey(prev => prev + 1); // Force re-render
  };

  // Handle repeat click in the complete screen
  const handleRepeatClick = () => {
    console.log("Repeat button clicked in Complete Screen");
    // Just call handleRepeat which already has all the reset logic
    handleRepeat();
  };

  // Handle play now button click to navigate to the game
  const handlePlayNow = () => {
    // Navigate to the game play route with the user's UID and level 1
    navigate(`/balance-quest/${uid}/game/level/${level}`);
  };

  // Part 1: Handle fruit drop animation
  useEffect(() => {
    if (!showPart2 && currentFruitIndex < fruits.length) {
      const timer = setTimeout(() => {
        setDroppedFruits((prev) => [...prev, fruits[currentFruitIndex].id]);
        setCurrentFruitIndex((prevIndex) => prevIndex + 1);
      }, 3000); // Delay each fruit drop by 3 seconds
      return () => clearTimeout(timer);
    } else if (!showPart2 && currentFruitIndex >= fruits.length) {
      setTimeout(() => setShowPart2(true), 2000); // Proceed to part 2 after all fruits drop
    }
  }, [currentFruitIndex, showPart2]);

  // Part 2: Auto-advance first step and immediately show timer for steps 1 and 2
  useEffect(() => {
    if (showPart2) {
      if (currentStep === 0) {
        // Auto-advance to step 1 after 2 seconds
        setTimeout(() => setCurrentStep(1), 2000);
      } else if (currentStep === 1 || currentStep === 2) {
        // Immediately show timer without delay
        setShowTimer(true);
        
        // Wait 1 second before auto-selecting the appropriate bin
        setTimeout(() => {
          // For step 1, highlight the correct bin (green)
          // For step 2, highlight the incorrect bin (garbage)
          const binToHighlight = currentStep === 1 ? 'correct' : 'incorrect';
          console.log(`Step ${currentStep}: Highlighting ${binToHighlight} bin`);
          setHighlightedBin(binToHighlight);
          setIsTimerRunning(true);
        }, 1000);
      }
    }
  }, [currentStep, showPart2]);

  // Part 2: Timer completion logic
  const handleTimerComplete = () => {
    setSelectedBin(highlightedBin === 'correct' ? "green" : "garbage");

    setTimeout(() => {
      if (currentStep < part2Steps.length - 1) {
        setCurrentStep((prevStep) => prevStep + 1);
        setSelectedBin(null);
        setShowTimer(false);
        setIsTimerRunning(false);
        setHighlightedBin(null);
      } else {
        setShowComplete(true);
      }
    }, 2000);
  };

  // Render Complete Screen
  const renderCompleteScreen = () => {
    return (
      <div className="instructions-complete-container">
        <h2 className="instructions-complete-text">
          You are all set. Are you ready to play?
        </h2>

        <div className="instructions-buttons">
          <button 
            className="repeat-button" 
            onClick={handleRepeatClick}
          >
            Repeat Instructions
          </button>
          <button 
            className="play-button" 
            onClick={handlePlayNow}
          >
            Play Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div key={resetKey}> {/* Force re-render when resetKey changes */}
      {showComplete ? (
        // PART 3: Complete screen (previously in a separate component)
        renderCompleteScreen()
      ) : !showPart2 ? (
        // PART 1: Initial fruits animation screen
        <div className="instructions-container">
          <button className="exit-button" onClick={() => navigate(`/balance-quest/${uid}/home-page`)}>
            Exit Game
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
          <div className="correct-bin"
            style={{
              left: "50%", /* Center horizontally */
              transform: "translateX(-50%)", /* Center the bin */
              bottom: "0", /* Align to the bottom of the screen */
              position: "absolute" /* Ensure absolute positioning */
            }}
          >CORRECT</div>
          
          {/* Continue button */}
          <button className="continue-button" onClick={handlePart1Skip}>
            Click to continue
          </button>
        </div>
      ) : (
        // PART 2: Bin selection instructions screen
        <div className="instructions-container">
          <button 
            className="exit-button" 
            onClick={() => navigate(`/balance-quest/${uid}/home-page`)}
            style={{ color: "#B45522" }}
          >
            Exit Game
          </button>
          
          {/* Instruction Text */}
          <h2 className="game-title">Game Instructions</h2>
          <p className="instruction-subtext">{part2Steps[currentStep].text}</p>

          {/* Visuals */}
          <div className="instructions-visuals">
            {/* Timer & Item - immediately shown for steps 1 and 2 */}
            {showTimer && part2Steps[currentStep].item && (
              <div className="item-timer">
                <CountdownCircleTimer
                  isPlaying={isTimerRunning}
                  duration={5}
                  colors={["#B45522"]}
                  size={200}
                  onComplete={handleTimerComplete}
                >
                  {({ remainingTime }) =>
                    selectedBin === null ? (
                      <img src={part2Steps[currentStep].item} alt="Item" className="timed-item" />
                    ) : (
                      <img
                        src={selectedBin === part2Steps[currentStep].correctBin ? "/correct.png" : "/incorrect.png"}
                        alt="Result"
                        className="timed-item"
                      />
                    )
                  }
                </CountdownCircleTimer>
              </div>
            )}

            {/* Add standing-left illustration when on step 1 (left foot instruction) */}
            {currentStep === 1 && (
              <div className="standing-illustration">
                <img 
                  src="/standing-left.png" 
                  alt="Balance on left foot" 
                  className="standing-image" 
                />
              </div>
            )}
            
            {/* Add standing-right illustration when on step 2 (right foot instruction) */}
            {currentStep === 2 && (
              <div className="standing-illustration standing-illustration-right">
                <img 
                  src="/standing-right.png" 
                  alt="Balance on right foot" 
                  className="standing-image" 
                />
              </div>
            )}
          </div>

          {/* Fixed Bins - Now with highlighting instead of arrows */}
          <div className="bins-container">
            <div 
              className={`correct-bin ${highlightedBin === 'correct' ? 'highlighted-bin' : ''}`}
              style={{
                left: '30%', /* Adjust this value for spacing */
                transform: 'translateX(-50%)', /* Center the bin */
              }}
            >
              CORRECT
            </div>
            <div 
              className={`incorrect-bin ${highlightedBin === 'incorrect' ? 'highlighted-bin' : ''}`}
              style={{
                left: '70%', /* Adjust this value for spacing */
                transform: 'translateX(-50%)', /* Center the bin */
              }}
            >
              INCORRECT
            </div>
          </div>
          
          {/* Continue button */}
          <button className="continue-button" onClick={handlePart2Skip}>
            Click to continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Game1Instructions;