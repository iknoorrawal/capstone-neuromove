import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function BalanceGame() {
    const [gameState, setGameState] = useState({
        category: '',
        referenceEmojis: [],
        testEmoji: ''
    });
    
    const [showReference, setShowReference] = useState(true);
    const [score, setScore] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [result, setResult] = useState(null);
    const [sensorData, setSensorData] = useState({ left: 0, right: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchGameState = async () => {
        try {
            const response = await fetch('http://localhost:8000/game/state');
            const data = await response.json();
            setGameState(data);
            setIsLoading(false);
            // When fetching new game state, show reference emojis first
            setShowReference(true);
        } catch (error) {
            console.error('Error fetching game state:', error);
            setIsLoading(false);
        }
    };

    const fetchSensorData = async () => {
        try {
            const response = await fetch('http://localhost:8000/sensor-data');
            const data = await response.json();
            setSensorData({ left: data.left, right: data.right });
            
            // Only check answer if we're showing the test emoji
            if (!showReference && (data.left === 1 || data.right === 1)) {
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
            setTotalAttempts(prev => prev + 1);
            
            if (data.correct) {
                setScore(prev => prev + 1);
            }
            
            // If answer was given, reset game after 2 seconds
            setTimeout(resetGame, 2000);
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    };

    const resetGame = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8000/game/reset', {
                method: 'POST'
            });
            const data = await response.json();
            setGameState(data);
            setResult(null);
            setShowReference(true);
            setIsLoading(false);
        } catch (error) {
            console.error('Error resetting game:', error);
            setIsLoading(false);
        }
    };

    const startTestPhase = () => {
        setShowReference(false);
    };

    useEffect(() => {
        fetchGameState();
        const interval = setInterval(fetchSensorData, 100);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Loading game...</Typography>
            </Box>
        );
    }

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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                        Score: {score}/{totalAttempts}
                    </Typography>
                    <Typography variant="h6">
                        Category: {gameState.category}
                    </Typography>
                </Box>

                {showReference ? (
                    <>
                        <Typography variant="h5" align="center" sx={{ mb: 3 }}>
                            Remember these category emojis:
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: 2, 
                            my: 3,
                            fontSize: '2rem'
                        }}>
                            {gameState.referenceEmojis && gameState.referenceEmojis.map((emoji, index) => (
                                <span key={index}>{emoji}</span>
                            ))}
                        </Box>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button variant="contained" onClick={startTestPhase}>
                                Start Game
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
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
                    </>
                )}

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button variant="outlined" onClick={resetGame}>
                        New Game
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default BalanceGame; 