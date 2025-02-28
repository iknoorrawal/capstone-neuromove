import React, { useState } from "react";
import Game3Instructions from "./game-3-instructions/Game3Instructions";

const Game3 = () => {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div>
      {showInstructions ? (
        <Game3Instructions onComplete={() => setShowInstructions(false)} />
      ) : (
        <h1>Game 3 Start!</h1>
      )}
    </div>
  );
};

export default Game3;