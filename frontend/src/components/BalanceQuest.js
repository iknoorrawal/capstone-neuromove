import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';

function BalanceQuest() {
  // ... existing state variables ...
  
  // Add new state for sensor data
  const [sensorData, setSensorData] = useState({
    leftSensor: 0.00,
    rightSensor: 0.00,
    status: 'Disconnected'
  });

  // Single useEffect to handle data fetching and timer
  useEffect(() => {
    let timerInterval;
    
    const fetchAndStartGame = async () => {
      try {
        // Only fetch if we don't have gameData yet
        if (!gameData) {
          const response = await axios.get(`http://127.0.0.1:8000/game?level=${level}`);
          setGameData(response.data);
        }
        
        // Start the timer
        timerInterval = setInterval(() => {
          setInitialTimer((prev) => {
            if (prev > 1) {
              return prev - 1;
            } else {
              clearInterval(timerInterval);
              setShowInitial(false);
              return 0;
            }
          });
        }, 1000);
      } catch (err) {
        setError(err.message);
      }
    };

    // Only start if we're in initial state and have no timer running
    if (initialTimer === config.memorizeTime) {
      fetchAndStartGame();
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [level, config.memorizeTime, gameData]); // Remove showInitial from dependencies

  // Add sensor polling effect
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorData();
    }, 100); // Poll every 100ms

    return () => clearInterval(interval);
  }, []);

  // Add sensor data fetching function
  const fetchSensorData = async () => {
    try {
      const response = await fetch('http://localhost:8000/sensor-data');
      const data = await response.json();
      
      setSensorData({
        leftSensor: data.left ?? 0.00,
        rightSensor: data.right ?? 0.00,
        status: data.connected ? 'Connected' : 'Disconnected'
      });

      // Only trigger if not in initial screen and game not done
      if (!showInitial && !done) {
        const threshold = 0.5; // Adjust threshold as needed
        
        if (data.left > threshold) {
          handleGuess(true); // "In Category" when left sensor is pressed
        }
        if (data.right > threshold) {
          handleGuess(false); // "Not In Category" when right sensor is pressed
        }
      }

    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData(prev => ({ ...prev, status: 'Error' }));
    }
  };

  // ... rest of the existing code ...

  // Modify the initial display screen JSX
  if (showInitial) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 4,
          background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)",
          position: "relative",
          textAlign: "center"
        }}
      >
        {ExitButtonAndDialog}

        <Typography variant="h3" sx={{ mb: 4, color: "#A0522D", fontWeight: "bold" }}>
          The following items belong
          <br />
          to one category
        </Typography>

        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 4, 
          my: 6,
          fontSize: "8rem"
        }}>
          {gameData.initialEmojis.map((item, idx) => (
            <span key={idx}>{item.emoji}</span>
          ))}
        </Box>

        <Typography variant="h5" sx={{ color: "#A0522D" }}>
          {initialTimer} second{initialTimer > 1 ? "s" : ""} remaining...
        </Typography>
      </Box>
    );
  }

  // ... rest of the existing JSX ...

  // Modify the buttons section in the return statement to show sensor status
  return (
    // ... existing JSX ...
    <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
      <Button
        variant="contained"
        onClick={() => handleGuess(true)}
        sx={{
          backgroundColor: sensorData.leftSensor > 0.5 ? '#8B4513' : '#A0522D',
          fontSize: "1.1rem",
          padding: "12px 32px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#8B4513"
          }
        }}
      >
        In Category
      </Button>

      <Button
        variant="outlined"
        onClick={() => handleGuess(false)}
        sx={{
          borderColor: sensorData.rightSensor > 0.5 ? '#8B4513' : '#A0522D',
          color: "#A0522D",
          fontSize: "1.1rem",
          padding: "12px 32px",
          borderRadius: "8px",
          "&:hover": {
            borderColor: "#8B4513",
            backgroundColor: "rgba(160, 82, 45, 0.1)"
          }
        }}
      >
        Not In Category
      </Button>
    </Box>
    // ... rest of the existing JSX ...
  );
}

// ... existing code ...

export default BalanceQuest; 