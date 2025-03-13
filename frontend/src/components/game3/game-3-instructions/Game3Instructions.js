import React, { useState } from "react";
import "./game-3-instructions.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate, useParams } from "react-router-dom";

const Game3Instructions = () => {
  const { uid, level } = useParams(); // Get user ID & level from URL
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const nextStep = () => {
    if (step < 5) {
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
        
        <button 
          className="exit-button"
          onClick={() => navigate(`/reach-and-recall/${uid}/home-page`)}
        >
          Exit Game
        </button>

        {step === 0 && (
          <div className="instruction-screen" onClick={nextStep} style={{ cursor: 'pointer' }}>
            <h2>Game Instructions</h2>
            <p>Ensure you are standing ~3 feet<br />away from the camera.</p>
            <div className="standing-distance-container">
              <img className="illustration stand" src="/standing.png" alt="Standing" />
              <div className="distance-line">
                <span>3 ft</span>
              </div>
            </div>
            <p className="click-continue">Click anywhere to continue.</p>
          </div>
        )}

        {step === 1 && (
          <div className="instruction-screen" onClick={nextStep} style={{ cursor: 'pointer' }}>
            <h2>Game Instructions</h2>
            <p>A set of numbers will be displayed.<br />Memorize these numbers.</p>
            <div className="number-display">
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <p className="click-continue">Click anywhere to continue.</p>
          </div>
        )}

        {step === 2 && (
          <div className="instruction-screen" onClick={nextStep} style={{ cursor: 'pointer' }}>
            <h2>Game Instructions</h2>
            <p>Reach and hold to select<br />the correct numbers.</p>
            <div className="reaching-container">
              <img className="illustration reach" src="/reaching.png" alt="Reach" />
              <div className="number-bubble">1</div>
            </div>
            <p className="click-continue">Click anywhere to continue.</p>
          </div>
        )}

        {step === 3 && (
          <div className="instruction-screen" onClick={nextStep} style={{ cursor: 'pointer' }}>
            <h2>Game Instructions</h2>
            <p>Hold for 3 seconds<br />to confirm selection.</p>
            <div className="reaching-container">
              <img className="illustration reach" src="/reaching.png" alt="Reach" />
              {!showCheckmark && countdown > 0 ? (
                <>
                  <div className="number-bubble">1</div>
                  <div className="countdown">
                    <CountdownCircleTimer
                      isPlaying
                      duration={3}
                      colors={["#d63384"]}
                      colorsTime={[3]}
                      size={45}
                      strokeWidth={5}
                      onComplete={() => {
                        setCountdown(0);
                        setShowCheckmark(true);
                        return { shouldRepeat: false };
                      }}
                    >
                      {() => null}
                    </CountdownCircleTimer>
                  </div>
                </>
              ) : showCheckmark ? (
                <div className="checkmark">
                  <img 
                    src="/checkmark.png"
                    alt="Checkmark"
                    style={{
                      position: 'absolute',
                      left: 'calc(50% - 132px)',
                      top: '21%',
                      width: '38px',
                      height: '38px',
                      zIndex: 13
                    }}
                  />
                </div>
              ) : null}
            </div>
            <p className="click-continue">Click anywhere to continue.</p>
          </div>
        )}

        {step === 4 && (
          <div className="instruction-screen" onClick={nextStep} style={{ cursor: 'pointer' }}>
            <h2>Game Instructions</h2>
            <p>Hold for 3 seconds<br />to confirm selection.</p>
            <div className="standing-container">
              <img className="illustration stand" src="/standing.png" alt="Standing" />
              <div className="number-bubble">1</div>
              <div className="countdown">
                <CountdownCircleTimer
                  isPlaying
                  duration={3}
                  colors={["#d63384"]}
                  colorsTime={[3]}
                  size={45}
                  strokeWidth={5}
                >
                  {() => null}
                </CountdownCircleTimer>
              </div>
            </div>
            <p className="click-continue">Click anywhere to continue.</p>
          </div>
        )}

        {step === 5 && (
          <div className="instruction-screen">
            <p>You are all set.<br />Are you ready to play?</p>
            <div className="button-group">
              <button onClick={restartInstructions}>Repeat Instructions</button>
              <button onClick={() => navigate(`/reach-and-recall/${uid}/memorize/level/${level}`)}>Play Now</button>
            </div>
          </div>
        )}
      </div>
    );
};

export default Game3Instructions;
