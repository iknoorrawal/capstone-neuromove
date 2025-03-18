import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function BalanceGame() {
    const [gameState, setGameState] = useState({
        category: '',
        referenceEmojis: [],
        testEmoji: ''
    });
    
    const [result, setResult] = useState(null);
    const [sensorData, setSensorData] = useState({ left: 0, right: 0 });

    const fetchGameState = async () => {
        try {
            const response = await fetch('http://localhost:8000/game/state');
            const data = await response.json();
            setGameState(data);
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    };

    const fetchSensorData = async () => {
        try {
            const response = await fetch('http://localhost:8000/sensor-data');
            const data = await response.json();
            setSensorData({ left: data.left, right: data.right });
            
            // If either sensor is pressed, check the answer
            if (data.left === 1 || data.right === 1) {
                checkAnswer(data.left, data.right);
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
        }
    };

    const checkAnswer = async (left, right) => {
        try {
            const response = await fetch(`http://localhost:8000/game/check?left_sensor=${left}&right_sensor=${right}`, {
                method: 'POST'
            });
            const data = await response.json();
            setResult(data);
            
            // If answer was correct, reset game after 2 seconds
            if (data.correct) {
                setTimeout(resetGame, 2000);
            }
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    };

    const resetGame = async () => {
        try {
            const response = await fetch('http://localhost:8000/game/reset', {
                method: 'POST'
            });
            const data = await response.json();
            setGameState(data);
            setResult(null);
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    };

    useEffect(() => {
        fetchGameState();
        const interval = setInterval(fetchSensorData, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 3
        }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, width: '100%' }}>
                <Typography variant="h4" gutterBottom align="center">
                    Balance Quest
                </Typography>

                <Typography variant="h6" gutterBottom align="center">
                    Category: {gameState.category}
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 2, 
                    my: 3,
                    fontSize: '2rem'
                }}>
                    {gameState.referenceEmojis.map((emoji, index) => (
                        <span key={index}>{emoji}</span>
                    ))}
                </Box>

                <Typography variant="h5" align="center" sx={{ my: 3 }}>
                    Does this emoji belong to the same category?
                </Typography>

                <Typography variant="h2" align="center" sx={{ my: 3 }}>
                    {gameState.testEmoji}
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    mt: 4 
                }}>
                    <Typography sx={{ 
                        p: 2, 
                        bgcolor: sensorData.left ? 'primary.main' : 'grey.300',
                        color: 'white',
                        borderRadius: 1
                    }}>
                        Left Sensor (In Category)
                    </Typography>
                    <Typography sx={{ 
                        p: 2, 
                        bgcolor: sensorData.right ? 'primary.main' : 'grey.300',
                        color: 'white',
                        borderRadius: 1
                    }}>
                        Right Sensor (Not in Category)
                    </Typography>
                </Box>

                {result && (
                    <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        bgcolor: result.correct ? 'success.light' : 'error.light',
                        borderRadius: 1
                    }}>
                        <Typography align="center">
                            {result.message}
                        </Typography>
                        {!result.correct && (
                            <Typography align="center">
                                The emoji was {result.expected}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button variant="contained" onClick={resetGame}>
                        New Game
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default BalanceGame; 