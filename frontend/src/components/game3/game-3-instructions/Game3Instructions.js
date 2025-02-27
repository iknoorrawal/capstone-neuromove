import React, { useState, useEffect } from "react";
import "./game-3-instructions.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate, useParams } from "react-router-dom";

const Game3Instructions = ( {onComplete}) => {
  const { uid, level } = useParams(); // Get user ID & level from URL
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(3); 

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate(`/reach-and-recall/${uid}/memorize/level/${level}`);
    }
  };

  const restartInstructions = () => {
    setStep(0);
    setCountdown(3); // Reset countdown so timer shows again
  };


  return (
      <div className="instructions-container">
        <img className="background-top-left" src="/top-left-wavy.png" alt="Top Left Wavy" />
        <img className="background-bottom-right" src="/bottom-right-wavy.png" alt="Bottom Right Wavy" />

        {step === 0 && (
          <div className="instruction-screen">
            <h2>Game Instructions</h2>
            <p>A set of numbers will be displayed. Memorize these numbers.</p>
            <div className="number-display">
              <span>1</span> <span>2</span> <span>3</span>
            </div>
            <button onClick={nextStep}>Next</button>
          </div>
        )}

      {step === 1 && (
        <div className="instruction-screen">
          <h2>Game Instructions</h2>
          <p>Reach and hold to select the correct numbers.</p>
          <div className="standing-container">
            <img className="illustration stand" src="/standing.png" alt="Standing" />
            <div className="number-bubble">1</div>
          </div>
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="instruction-screen">
          <h2>Game Instructions</h2>
          <p>Hold for 3 seconds to confirm selection.</p>

          <div className="reaching-container">
            <img className="illustration reach" src="/reaching.png" alt="Reach" />

            {/* Show both the number bubble and timer if countdown is > 0 */}
            {countdown > 0 && (
              <>
                <div className="number-bubble">1</div>
                <div className="countdown">
                  <CountdownCircleTimer
                    isPlaying
                    duration={3}
                    colors={["#ff758c", "#F7B801", "#A30000"]}
                    colorsTime={[3, 2, 0]}
                    size={50}
                    strokeWidth={6}
                    onComplete={() => {
                      setCountdown(0);
                      return { shouldRepeat: false, delay: 1 }; 
                    }}
                  >
                     {() => null} {/* Hides numbers inside the timer */}
                  </CountdownCircleTimer>
                </div>
              </>
            )}
          </div>
          <button onClick={nextStep}>Next</button>
        </div>
      )}


      {step === 3 && (
        <div className="instruction-screen">
          <h2>You are all set. Are you ready to play?</h2>
          <div className="button-group">
            <button onClick={restartInstructions}>Repeat Instructions</button>
            <button onClick={onComplete}>Play Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game3Instructions;
