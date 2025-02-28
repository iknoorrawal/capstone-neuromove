// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// import { db } from "../../firebase";
// import { doc, setDoc } from "firebase/firestore";
// import { v4 as uuidv4 } from "uuid";
// import { Timestamp } from "firebase/firestore";

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogTitle
// } from "@mui/material";

// import FinalScore from "./final_score";

// function BalanceQuest() {
//   const { uid } = useParams();
//   const navigate = useNavigate();

//   const [gameData, setGameData] = useState(null);
//   const [error, setError] = useState(null);
//   const [gameId] = useState(uuidv4());

//   const [showInitial, setShowInitial] = useState(true);
//   const [initialTimer, setInitialTimer] = useState(10); // 10 seconds

//   const [guessIndex, setGuessIndex] = useState(0);
//   const [score, setScore] = useState(0);
//   const [done, setDone] = useState(false);

//   const [guessTimer, setGuessTimer] = useState(5);
//   const [dataSaved, setDataSaved] = useState(false);
//   const [openConfirm, setOpenConfirm] = useState(false);


//   useEffect(() => {
//     const fetchGameData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/game");
//         setGameData(response.data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };
//     fetchGameData();
//   }, []);


//   useEffect(() => {
//     if (gameData && showInitial) {
//       const interval = setInterval(() => {
//         setInitialTimer((prev) => {
//           if (prev > 1) {
//             return prev - 1;
//           } else {
//             clearInterval(interval);
//             setShowInitial(false);
//             return 0;
//           }
//         });
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [gameData, showInitial]);


//   useEffect(() => {
//     if (gameData && !showInitial && !done) {
//       setGuessTimer(5);

//       const interval = setInterval(() => {
//         setGuessTimer((prev) => {
//           if (prev > 1) {
//             return prev - 1;
//           } else {
//             clearInterval(interval);
//             goToNextGuess();
//             return 0;
//           }
//         }, 1000);
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [guessIndex, showInitial, done, gameData]);

//   const goToNextGuess = () => {
//     if (!gameData) return;
//     if (guessIndex + 1 < gameData.guessEmojis.length) {
//       setGuessIndex(guessIndex + 1);
//     } else {
//       setDone(true);
//     }
//   };


//   const handleGuess = (userSaysInCategory) => {
//     if (!gameData || done) return;

//     const currentEmoji = gameData.guessEmojis[guessIndex];
//     const correctAnswer = currentEmoji.inGroup;
//     if (userSaysInCategory === correctAnswer) {
//       setScore((prev) => prev + 1);
//     }
//     goToNextGuess();
//   };

//   useEffect(() => {
//     if (done && !dataSaved && gameData) {
//       const docRef = doc(db, `users/${uid}/game1/${gameId}`);

//       setDoc(docRef, {
//         guessEmojis: gameData.guessEmojis,
//         correct_count: score, 
//         incorrect_count: gameData.guessEmojis.length-score,
//         initalCategory: gameData.initialEmojis,
//         timestamp: Timestamp.now()
//       })
//         .then(() => {
//           console.log("Game result saved to Firebase!");
//         })
//         .catch((err) => {
//           console.error("Error saving to Firebase:", err);
//         })
//         .finally(() => {
//           setDataSaved(true);
//         });
//     }
//   }, [done, dataSaved, uid, gameData, score]);

//   const handleOpenConfirm = () => {
//     setOpenConfirm(true);
//   };

//   const handleCloseConfirm = () => {
//     setOpenConfirm(false);
//   };

//   const handleConfirmExit = () => {
//     setOpenConfirm(false);
//     // Navigate away, e.g. to the same "home-page" or to the dashboard
//     navigate(`/balance-quest/${uid}/home-page`);
//   };

//   if (error) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         Error: {error}
//       </div>
//     );
//   }

//   if (!gameData) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         Loading...
//       </div>
//     );
//   }

//   // Final screen
//   if (done) {
//     return (
//       <FinalScore
//         score={score}
//         total={gameData.guessEmojis.length}
//         uid={uid}
//         gameId={gameId}
//       />
//     );
//   }

//   const ExitButtonAndDialog = (
//     <>
//       {/* Exit button in top-left corner */}
//       <Box sx={{ position: "absolute", top: 16, left: 16 }}>
//         <Button
//           variant="outlined"
//           sx={{ borderColor: "#A0522D", color: "#A0522D" }}
//           onClick={handleOpenConfirm}
//         >
//           Exit Game
//         </Button>
//       </Box>

//       {/* Confirmation Dialog */}
//       <Dialog open={openConfirm} onClose={handleCloseConfirm}>
//         <DialogTitle>Are you sure you want to exit?</DialogTitle>
//         <DialogActions>
//           <Button onClick={handleCloseConfirm}>No</Button>
//           <Button onClick={handleConfirmExit} color="error">
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );

//   // -- 7. First screen: show category emojis --
//   if (showInitial) {
//     return (
//       <div
//         style={{
//           textAlign: "center",
//           marginTop: "50px",
//           fontFamily: "sans-serif",
//           position: "relative", // allows the absolutely positioned button
//         }}
//       >
//         {ExitButtonAndDialog}

//         <h1 style={{ marginBottom: "20px", color: "#A0522D" }}>
//           The following items belong
//           <br />
//           to one category.
//         </h1>

//         <div style={{ fontSize: "8rem", margin: "40px 0" }}>
//           {gameData.initialEmojis.map((item, idx) => (
//             <span key={idx} style={{ margin: "0 25px" }}>
//               {item.emoji}
//             </span>
//           ))}
//         </div>

//         <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
//           {initialTimer} second
//           {initialTimer > 1 ? "s" : ""} remaining...
//         </p>
//       </div>
//     );
//   }

//   const currentGuess = gameData.guessEmojis[guessIndex];

//   const radius = 70;
//   const circumference = 2 * Math.PI * radius;
//   const fraction = guessTimer / 5;
//   const strokeDashoffset = circumference * (1 - fraction);

//   return (
//     <div
//       style={{
//         textAlign: "center",
//         marginTop: "50px",
//         fontFamily: "sans-serif",
//         position: "relative",
//       }}
//     >
//       {ExitButtonAndDialog}

//       <h1 style={{ color: "#A0522D" }}>Select the correct answer</h1>

//       <div
//         style={{
//           position: "relative",
//           width: "150px",
//           height: "150px",
//           margin: "40px auto",
//         }}
//       >
//         {/* Circular SVG countdown (brown stroke) */}
//         <svg width="150" height="150">
//           <circle
//             cx="75"
//             cy="75"
//             r={radius}
//             fill="none"
//             stroke="#A0522D"
//             strokeWidth="10"
//             strokeDasharray={circumference}
//             strokeDashoffset={strokeDashoffset}
//             strokeLinecap="round"
//           />
//         </svg>

//         {/* Center the emoji absolutely on top of the SVG */}
//         <div
//           style={{
//             position: "absolute",
//             top: "0",
//             left: "0",
//             width: "150px",
//             height: "150px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "5rem",
//           }}
//         >
//           {currentGuess.emoji}
//         </div>
//       </div>

//       <div style={{ marginTop: "30px" }}>
//         <button
//           onClick={() => handleGuess(true)}
//           style={{
//             fontSize: "1.2rem",
//             marginRight: "40px",
//             padding: "10px 20px",
//             cursor: "pointer",
//           }}
//         >
//           In Category
//         </button>

//         <button
//           onClick={() => handleGuess(false)}
//           style={{
//             fontSize: "1.2rem",
//             padding: "10px 20px",
//             cursor: "pointer",
//           }}
//         >
//           Not In Category
//         </button>
//       </div>

//       <p style={{ marginTop: "30px", fontSize: "1.1rem" }}>
//         Score: {score} / {guessIndex} &nbsp;|&nbsp; Time left: {guessTimer}s
//       </p>
//     </div>
//   );
// }

// export default BalanceQuest;


import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  CircularProgress
} from "@mui/material";

import FinalScore from "./final_score";

function BalanceQuest() {
//   const { uid } = useParams();
//   const navigate = useNavigate();

//   const [gameData, setGameData] = useState(null);
//   const [error, setError] = useState(null);
//   const [gameId] = useState(uuidv4());

//   const [showInitial, setShowInitial] = useState(true);
//   const [initialTimer, setInitialTimer] = useState(10); // 10 seconds

//   const [guessIndex, setGuessIndex] = useState(0);
//   const [score, setScore] = useState(0);
//   const [done, setDone] = useState(false);

//   const [guessTimer, setGuessTimer] = useState(5);
//   const [dataSaved, setDataSaved] = useState(false);
//   const [openConfirm, setOpenConfirm] = useState(false);
  
//   // Arduino WebSocket connection state
//   const [isConnected, setIsConnected] = useState(false);
//   const [forceData, setForceData] = useState({ left: 0, right: 0 });
//   const [lastPress, setLastPress] = useState(null);
//   const socketRef = useRef(null);
//   const cooldownRef = useRef(false);
  
//   // Connect to the WebSocket server
//   useEffect(() => {
//     // Use the FastAPI WebSocket endpoint
//     const socket = new WebSocket("ws://localhost:8000/ws");
//     socketRef.current = socket;
    
//     socket.onopen = () => {
//       console.log("Connected to Arduino WebSocket server");
//       setIsConnected(true);
//     };
    
//     socket.onclose = () => {
//       console.log("Disconnected from Arduino WebSocket server");
//       setIsConnected(false);
      
//       // Try to reconnect after 2 seconds
//       setTimeout(() => {
//         if (socketRef.current?.readyState === WebSocket.CLOSED) {
//           console.log("Attempting to reconnect...");
//           const newSocket = new WebSocket("ws://localhost:8000/ws");
//           socketRef.current = newSocket;
          
//           // Set up event handlers for the new socket
//           newSocket.onopen = socket.onopen;
//           newSocket.onclose = socket.onclose;
//           newSocket.onerror = socket.onerror;
//           newSocket.onmessage = socket.onmessage;
//         }
//       }, 2000);
//     };
    
//     socket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       setError("Failed to connect to force sensors");
//     };
    
//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         setForceData(data);
//         setIsConnected(data.connected);
        
//         // Check if either force strip is pressed
//         if (!cooldownRef.current && !done && !showInitial) {
//           if (data.left_pressed) {
//             cooldownRef.current = true;
//             setLastPress("left");
//             handleGuess(false); // Left = Not in category
//             setTimeout(() => { cooldownRef.current = false; }, 1000); // Debounce
//           } 
//           else if (data.right_pressed) {
//             cooldownRef.current = true;
//             setLastPress("right");
//             handleGuess(true); // Right = In category
//             setTimeout(() => { cooldownRef.current = false; }, 1000); // Debounce
//           }
//         }
//       } catch (err) {
//         console.error("Error parsing WebSocket data:", err);
//       }
//     };
    
//     // Keep connection alive by sending a ping every 30 seconds
//     const pingInterval = setInterval(() => {
//       if (socketRef.current?.readyState === WebSocket.OPEN) {
//         socketRef.current.send("ping");
//       }
//     }, 30000);
    
//     return () => {
//       clearInterval(pingInterval);
//       socket.close();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchGameData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/game");
//         setGameData(response.data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };
//     fetchGameData();
//   }, []);


//   useEffect(() => {
//     if (gameData && showInitial) {
//       const interval = setInterval(() => {
//         setInitialTimer((prev) => {
//           if (prev > 1) {
//             return prev - 1;
//           } else {
//             clearInterval(interval);
//             setShowInitial(false);
//             return 0;
//           }
//         });
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [gameData, showInitial]);


//   useEffect(() => {
//     if (gameData && !showInitial && !done) {
//       setGuessTimer(5);

//       const interval = setInterval(() => {
//         setGuessTimer((prev) => {
//           if (prev > 1) {
//             return prev - 1;
//           } else {
//             clearInterval(interval);
//             goToNextGuess();
//             return 0;
//           }
//         });
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [guessIndex, showInitial, done, gameData]);

//   const goToNextGuess = () => {
//     if (!gameData) return;
//     if (guessIndex + 1 < gameData.guessEmojis.length) {
//       setGuessIndex(guessIndex + 1);
//     } else {
//       setDone(true);
//     }
//   };


//   const handleGuess = (userSaysInCategory) => {
//     if (!gameData || done) return;

//     const currentEmoji = gameData.guessEmojis[guessIndex];
//     const correctAnswer = currentEmoji.inGroup;
//     if (userSaysInCategory === correctAnswer) {
//       setScore((prev) => prev + 1);
//     }
//     goToNextGuess();
//   };

//   useEffect(() => {
//     if (done && !dataSaved && gameData) {
//       const docRef = doc(db, `users/${uid}/game1/${gameId}`);

//       setDoc(docRef, {
//         guessEmojis: gameData.guessEmojis,
//         correct_count: score, 
//         incorrect_count: gameData.guessEmojis.length-score,
//         initalCategory: gameData.initialEmojis,
//         timestamp: Timestamp.now()
//       })
//         .then(() => {
//           console.log("Game result saved to Firebase!");
//         })
//         .catch((err) => {
//           console.error("Error saving to Firebase:", err);
//         })
//         .finally(() => {
//           setDataSaved(true);
//         });
//     }
//   }, [done, dataSaved, uid, gameData, score]);

//   const handleOpenConfirm = () => {
//     setOpenConfirm(true);
//   };

//   const handleCloseConfirm = () => {
//     setOpenConfirm(false);
//   };

//   const handleConfirmExit = () => {
//     setOpenConfirm(false);
//     // Navigate away, e.g. to the same "home-page" or to the dashboard
//     navigate(`/balance-quest/${uid}/home-page`);
//   };

//   if (error) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         Error: {error}
//       </div>
//     );
//   }

//   if (!gameData) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         Loading...
//       </div>
//     );
//   }

//   // Final screen
//   if (done) {
//     return (
//       <FinalScore
//         score={score}
//         total={gameData.guessEmojis.length}
//         uid={uid}
//         gameId={gameId}
//       />
//     );
//   }

//   const ExitButtonAndDialog = (
//     <>
//       {/* Exit button in top-left corner */}
//       <Box sx={{ position: "absolute", top: 16, left: 16 }}>
//         <Button
//           variant="outlined"
//           sx={{ borderColor: "#A0522D", color: "#A0522D" }}
//           onClick={handleOpenConfirm}
//         >
//           Exit Game
//         </Button>
//       </Box>

//       {/* Confirmation Dialog */}
//       <Dialog open={openConfirm} onClose={handleCloseConfirm}>
//         <DialogTitle>Are you sure you want to exit?</DialogTitle>
//         <DialogActions>
//           <Button onClick={handleCloseConfirm}>No</Button>
//           <Button onClick={handleConfirmExit} color="error">
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );

//   // Arduino connection status indicator
//   const ConnectionStatus = (
//     <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center" }}>
//       <Typography variant="body2" sx={{ mr: 1 }}>
//         Force Sensors: {isConnected ? "Connected" : "Disconnected"}
//       </Typography>
//       <span style={{ 
//         display: "inline-block", 
//         width: "12px", 
//         height: "12px", 
//         borderRadius: "50%", 
//         backgroundColor: isConnected ? "green" : "red" 
//       }}></span>
//     </Box>
//   );

//   // -- First screen: show category emojis --
//   if (showInitial) {
//     return (
//       <div
//         style={{
//           textAlign: "center",
//           marginTop: "50px",
//           fontFamily: "sans-serif",
//           position: "relative",
//         }}
//       >
//         {ExitButtonAndDialog}
//         {ConnectionStatus}

//         <h1 style={{ marginBottom: "20px", color: "#A0522D" }}>
//           The following items belong
//           <br />
//           to one category.
//         </h1>

//         <div style={{ fontSize: "8rem", margin: "40px 0" }}>
//           {gameData.initialEmojis.map((item, idx) => (
//             <span key={idx} style={{ margin: "0 25px" }}>
//               {item.emoji}
//             </span>
//           ))}
//         </div>

//         <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
//           {initialTimer} second
//           {initialTimer > 1 ? "s" : ""} remaining...
//         </p>
        
//         <div style={{ marginTop: "50px" }}>
//           <p>Get ready to use the force sensors:</p>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "center", 
//             alignItems: "center", 
//             marginTop: "20px" 
//           }}>
//             <div style={{ textAlign: "center", marginRight: "40px" }}>
//               <div style={{ 
//                 width: "120px", 
//                 height: "40px", 
//                 border: "2px solid red",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}>
//                 <span>LEFT = NO</span>
//               </div>
//               <p>Not In Category</p>
//             </div>
            
//             <div style={{ textAlign: "center" }}>
//               <div style={{ 
//                 width: "120px", 
//                 height: "40px", 
//                 border: "2px solid green",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}>
//                 <span>RIGHT = YES</span>
//               </div>
//               <p>In Category</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const currentGuess = gameData.guessEmojis[guessIndex];

//   const radius = 70;
//   const circumference = 2 * Math.PI * radius;
//   const fraction = guessTimer / 5;
//   const strokeDashoffset = circumference * (1 - fraction);

//   return (
//     <div
//       style={{
//         textAlign: "center",
//         marginTop: "50px",
//         fontFamily: "sans-serif",
//         position: "relative",
//       }}
//     >
//       {ExitButtonAndDialog}
//       {ConnectionStatus}

//       <h1 style={{ color: "#A0522D" }}>Select the correct answer</h1>

//       <div
//         style={{
//           position: "relative",
//           width: "150px",
//           height: "150px",
//           margin: "40px auto",
//         }}
//       >
//         {/* Circular SVG countdown (brown stroke) */}
//         <svg width="150" height="150">
//           <circle
//             cx="75"
//             cy="75"
//             r={radius}
//             fill="none"
//             stroke="#A0522D"
//             strokeWidth="10"
//             strokeDasharray={circumference}
//             strokeDashoffset={strokeDashoffset}
//             strokeLinecap="round"
//           />
//         </svg>

//         {/* Center the emoji absolutely on top of the SVG */}
//         <div
//           style={{
//             position: "absolute",
//             top: "0",
//             left: "0",
//             width: "150px",
//             height: "150px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "5rem",
//           }}
//         >
//           {currentGuess.emoji}
//         </div>
//       </div>

//       {/* Force strips visualization and instructions */}
//       <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
//         <div style={{ 
//           width: "120px", 
//           height: "40px", 
//           background: `rgba(255, 0, 0, ${Math.min(forceData.left / 5, 1)})`, 
//           border: `2px solid ${lastPress === 'left' ? 'red' : 'gray'}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           marginRight: "40px"
//         }}>
//           <span style={{ 
//             color: forceData.left > 2 ? 'white' : 'black',
//             fontWeight: 'bold'
//           }}>LEFT = NO</span>
//         </div>
        
//         <div style={{ 
//           width: "120px", 
//           height: "40px", 
//           background: `rgba(0, 128, 0, ${Math.min(forceData.right / 5, 1)})`, 
//           border: `2px solid ${lastPress === 'right' ? 'green' : 'gray'}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center"
//         }}>
//           <span style={{ 
//             color: forceData.right > 2 ? 'white' : 'black',
//             fontWeight: 'bold'
//           }}>RIGHT = YES</span>
//         </div>
//       </div>

//       <p style={{ marginTop: "10px", fontSize: "1rem" }}>
//         Press LEFT force strip for "Not In Category" / Press RIGHT force strip for "In Category"
//       </p>

//       <p style={{ marginTop: "30px", fontSize: "1.1rem" }}>
//         Score: {score} / {guessIndex} &nbsp;|&nbsp; Time left: {guessTimer}s
//       </p>
//     </div>
//   );

// const SensorDisplay = () => {
  // function ArduinoSensorData() {
    const [data, setData] = useState({
      left: 0.0,
      right: 0.0,
      left_pressed: false,
      right_pressed: false,
      connected: false,
    });
  
    useEffect(() => {
      const socket = new WebSocket("ws://127.0.0.1:8000/ws");
      
      socket.onopen = () => {
        console.log("WebSocket connected");
      };
      
      socket.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      socket.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        setData(prev => ({ ...prev, connected: false }));
      };
      
      // Send a ping periodically to keep the connection alive
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 30000);
      
      return () => {
        clearInterval(interval);
        socket.close();
      };
    }, []);
  
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Arduino Sensor Data</h2>
        <p>Connected: <span style={{ color: data.connected ? 'green' : 'red' }}>
          {data.connected ? "Yes" : "No"}
        </span></p>
        <p>Left Force: {data.left.toFixed(2)}</p>
        <p>Right Force: {data.right.toFixed(2)}</p>
        <p>Left Pressed: <span style={{ color: data.left_pressed ? 'green' : 'red' }}>
          {data.left_pressed ? "Yes" : "No"}
        </span></p>
        <p>Right Pressed: <span style={{ color: data.right_pressed ? 'green' : 'red' }}>
          {data.right_pressed ? "Yes" : "No"}
        </span></p>
      </div>
    );
  }
// }

export default BalanceQuest;