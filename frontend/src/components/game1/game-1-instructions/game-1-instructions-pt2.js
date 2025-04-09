import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./game-1-instructions-pt2.css";
import Game1InstructionsComplete from "./game-1-instructions-complete"; //  Import final screen
import "./bucket.css";

const Game1InstructionsPart2 = ({ onComplete, onBack, onRestart, level }) => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [isBalancingLeft, setIsBalancingLeft] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showStaticScreen, setShowStaticScreen] = useState(false);

  // Updated steps array to include the first instruction
  const steps = [
    { text: "Similar items go in the green bin.", item: "/pineapple.png", correctBin: "green" },
    { text: "Balance on your left foot to select the green bin.", item: "/pineapple.png", correctBin: "green" },
    { text: "Items not in category go in the incorrect bin.", item: "/car.png", correctBin: "garbage" },
    { text: "Balance on your right foot to select the incorrect bin.", item: "/car.png", correctBin: "garbage" },
  ];

  // Auto-advance first step after 2s
  useEffect(() => {
    if (currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 3) {
      setShowTimer(true);
      // Automatically start timer only on the animation screens (steps 1 and 3)
      if (currentStep === 1 || currentStep === 3) {
        setIsBalancingLeft(true);
        setIsTimerRunning(true);
      }
    }
  }, [currentStep]);

  // Move image preloading to the top and make it more robust
  useEffect(() => {
    const imagesToPreload = [
      '/pineapple.png',
      '/car.png',
      '/correct.png',
      '/incorrect.png',
      '/left-arrow-grey.png',
      '/left-arrow-highlighted.png',
      '/right-arrow-grey.png',
      '/right-arrow-highlighted.png',
      '/standing-left.png',
      '/standing-right.png',
      '/standing-off-mat.png'  // Add the new image to preload
    ];

    let loadedImages = 0;
    const totalImages = imagesToPreload.length;

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  // Don't render content until images are loaded
  if (!imagesLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ color: '#B45522', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  // Update the timer completion handler
  const handleTimerComplete = () => {
    if (currentStep === 1) { // Pineapple to correct bin
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationComplete(true);
      }, 1000);
    } else if (currentStep === 3) { // Car to incorrect bin (now step 3)
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationComplete(true);
      }, 1000);
    }
    return { shouldRepeat: false };
  };

  // Update the click handler to show final screen after car animation
  const handleScreenClick = () => {
    // Allow clicks at any time, regardless of animation state
    if (currentStep === 3) {
      // Show static screen instead of final screen
      setShowStaticScreen(true);
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedBin(null);
      setShowTimer(false);
      setIsTimerRunning(false);
      setIsBalancingLeft(null);
      setAnimationComplete(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(`/balance-quest/${uid}/home-page`);
  };

  // Add this function to handle restart
  const handleRestart = () => {
    setCurrentStep(0);
    setShowTimer(false);
    setIsBalancingLeft(null);
    setSelectedBin(null);
    setIsTimerRunning(false);
    setShowFinalScreen(false);
    setIsAnimating(false);
    setAnimationComplete(false);
  };

  // Update the final screen render
  if (showFinalScreen) {
    return <Game1InstructionsComplete 
      onBack={handleBack} 
      onComplete={onComplete}
      onRestart={onRestart}
      uid={uid}
      level={level}
    />;
  }

  // Add static screen render
  if (showStaticScreen) {
    return (
      <div 
        className="instructions-container" 
        onClick={() => setShowFinalScreen(true)}
        style={{ 
          cursor: 'pointer',
          padding: '5rem 2rem',
          position: 'relative',
          width: '100%'
        }}
      >
        <button 
          className="exit-button"
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
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

        <div style={{ marginTop: '8rem', marginBottom: '1rem' , width: '70vw'}}>
          <h2 className="game-title">Game Instructions</h2>
          <p className="instruction-subtext">
            Please step off the mat once you've finished categorizing an item so it can reset for the next selection.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '2rem 0'
        }}>
          <img 
            src="/standing-off-mat.png" 
            alt="Standing Position"
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              minHeight: '300px',
              objectFit: 'contain'
            }}
          />
        </div>

        <p style={{
          color: '#B45522',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          Click anywhere to continue
        </p>
      </div>
    );
  }

  // Update the animation keyframes
  const animationStyles = `
    @keyframes moveToCorrectBin {
      0% {
        transform: translate(-50%, -50%);
      }
      50% {
        transform: translate(-250px, 0) scale(0.9);
      }
      100% {
        transform: translate(-250px, 300px) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes moveToIncorrectBin {
      0% {
        transform: translate(-50%, -50%);
      }
      50% {
        transform: translate(250px, 0) scale(0.9);
      }
      100% {
        transform: translate(250px, 300px) scale(0.8);
        opacity: 0;
      }
    }
  `;

  return (
    <div 
      className="instructions-container" 
      onClick={handleScreenClick}
      style={{ 
        cursor: 'pointer',
        padding: '5rem 2rem',
        position: 'relative',
        width: '100%'
      }}
    >
      <style>{animationStyles}</style>
      <button 
        className="exit-button"
        onClick={(e) => {
          e.stopPropagation();
          handleBack();
        }}
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

      <div style={{ marginTop: '8rem', marginBottom: '4rem' }}> {/* Increased bottom margin */}
        <h2 className="game-title">Game Instructions</h2>
        <p className="instruction-subtext">{steps[currentStep].text}</p>
      </div>

      {/* Visuals */}
      <div className="instructions-visuals" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4rem' /* Increased gap between components */
      }}>
        {showTimer && steps[currentStep].item && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '3rem',
            position: 'relative'
          }}>
            <CountdownCircleTimer
              isPlaying={isTimerRunning}
              duration={5}
              colors={animationComplete ? ['#77B04A'] : ["#B45522"]}
              size={200}
              onComplete={handleTimerComplete}
              trailColor={animationComplete ? "rgba(119, 176, 74, 0.2)" : "rgba(180, 85, 34, 0.2)"}
            >
              {({ remainingTime }) => (
                <>
                  {!animationComplete && (
                    <img 
                      src={steps[currentStep].item} 
                      alt="Item" 
                      className="timed-item"
                      style={{
                        animation: isAnimating ? 
                          (currentStep === 1 ? 'moveToCorrectBin 1s ease-in forwards' : 'moveToIncorrectBin 1s ease-in forwards') 
                          : 'none',
                        position: isAnimating ? 'absolute' : 'static',
                        zIndex: 10
                      }}
                    />
                  )}
                  {animationComplete && (
                    <img 
                      src="/correct.png"
                      alt="Correct"
                      style={{
                        width: '100px',
                        height: '100px'
                      }}
                    />
                  )}
                </>
              )}
            </CountdownCircleTimer>
            
            {/* Show text on all screens */}
            <p style={{
              color: '#B45522',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Click anywhere to continue
            </p>
          </div>
        )}
      </div>

      {/* Arrows container */}
      <div className="arrows-container" style={{ marginTop: '2rem' }}>
        <img
          src={currentStep === 1 ? "/left-arrow-highlighted.png" : "/left-arrow-grey.png"}
          alt="Left Arrow"
          className="left-arrow"
        />
        <img
          src={currentStep === 3 ? "/right-arrow-highlighted.png" : "/right-arrow-grey.png"}
          alt="Right Arrow"
          className="right-arrow"
        />
      </div>

      {/* Bins container */}
      <div className="bins-container">
        {/* Add standing-left image between bins when on step 1 */}
        {currentStep === 1 && (
          <img
            src="/standing-left.png"
            alt="Standing on Left Foot"
            className="standing-position"
          />
        )}
        
        {/* Add standing-right image between bins when on step 3 */}
        {currentStep === 3 && (
          <img
            src="/standing-right.png"
            alt="Standing on Right Foot"
            className="standing-position"
          />
        )}
        
        <div className="correct-bin"
            style={{
              left: '25%', /* Changed from 30% to move further left */
              transform: 'translateX(-50%)', /* Center the bin */
            }}
        >
          CORRECT
        </div>
        <div className="incorrect-bin"
            style={{
              left: '75%', /* Changed from 70% to move further right */
              transform: 'translateX(-50%)', /* Center the bin */
            }}
        >
          INCORRECT
        </div>
      </div>
    </div>
  );
};

export default Game1InstructionsPart2;
