import React, { useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./game-1-instructions-pt2.css";
import Game1InstructionsComplete from "./game-1-instructions-complete"; // ✅ Import final screen

const Game1InstructionsPart2 = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [isBalancingLeft, setIsBalancingLeft] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false); // ✅ Handles transition

  // Steps for instructions
  const steps = [
    { text: "Similar items go in the green bin.", item: null, correctBin: null },
    { text: "Balance on your left foot to select the green bin.", item: "/pineapple.png", correctBin: "green" },
    { text: "Let’s try another example.", item: "/car.png", correctBin: "garbage" },
  ];

  // Auto-advance first step after 2s
  useEffect(() => {
    if (currentStep === 0) {
      setTimeout(() => setCurrentStep(1), 2000);
    } else if (currentStep === 1 || currentStep === 2) {
      setTimeout(() => {
        setShowTimer(true);
        setIsTimerRunning(false);
      }, 1000);
    }
  }, [currentStep]);

  // Start timer when a bin is selected (via balance or click)
  const handleSelectBin = (isLeft) => {
    if (!isTimerRunning) {
      setIsBalancingLeft(isLeft);
      setIsTimerRunning(true);
    }
  };

  // Timer completion logic (Show ✅ or ❌ and advance)
  const handleTimerComplete = () => {
    setSelectedBin(isBalancingLeft ? "green" : "garbage");

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prevStep) => prevStep + 1);
        setSelectedBin(null);
        setShowTimer(false);
        setIsTimerRunning(false);
        setIsBalancingLeft(null);
      } else {
        setShowFinalScreen(true); // ✅ Show final confirmation screen
      }
    }, 2000);
  };

  // ✅ Show final page when all steps are complete
  if (showFinalScreen) {
    return <Game1InstructionsComplete onBack={onBack} onComplete={onComplete} />;
  }

  return (
    <div className="instructions-container">
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        <img src="/back-arrow.png" alt="Back" className="back-arrow" />
      </button>

      {/* Instruction Text */}
      <h2 className="game-title">Game Instructions</h2>
      <p className="instruction-subtext">{steps[currentStep].text}</p>

      {/* Visuals */}
      <div className="instructions-visuals">
        {/* Timer & Item */}
        {showTimer && steps[currentStep].item && (
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
                  <img src={steps[currentStep].item} alt="Item" className="timed-item" />
                ) : (
                  <img
                    src={selectedBin === steps[currentStep].correctBin ? "/correct.png" : "/incorrect.png"}
                    alt="Result"
                    className="timed-item"
                  />
                )
              }
            </CountdownCircleTimer>
          </div>
        )}

        {/* Arrows - Only show at Step 1 and beyond */}
        {currentStep >= 1 && (
          <div className="arrows-container">
            <img
              src={
                isBalancingLeft === null
                  ? "/left-arrow-grey.png"
                  : isBalancingLeft
                  ? "/left-arrow-highlighted.png"
                  : "/left-arrow-grey.png"
              }
              alt="Left Arrow"
              className="left-arrow"
              onClick={() => handleSelectBin(true)}
            />
            <img
              src={
                isBalancingLeft === null
                  ? "/right-arrow-grey.png"
                  : isBalancingLeft
                  ? "/right-arrow-grey.png"
                  : "/right-arrow-highlighted.png"
              }
              alt="Right Arrow"
              className="right-arrow"
              onClick={() => handleSelectBin(false)}
            />
          </div>
        )}
      </div>

      {/* Fixed Bins */}
      <div className="bins-container">
        <div className="bin-wrapper">
          <img className="green-bin" src="/bucket.png" alt="Green Bin" />
        </div>
        <div className="bin-wrapper">
          <img className="garbage-bin" src="/garbage.png" alt="Garbage Bin" />
        </div>
      </div>
    </div>
  );
};

export default Game1InstructionsPart2;
