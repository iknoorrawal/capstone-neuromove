import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { calculateScore } from './game_config';

const FinalScore = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const saveScore = async () => {  // Create async function inside useEffect
            if (!user) {
                return;
            }
            
            if (!location.state) {
                navigate(`/reach-and-recall/${user.uid}/home-page`);
                return;
            }
            
            if (location.state.uid !== user.uid) {
                navigate(`/reach-and-recall/${user.uid}/home-page`);
                return;
            }

            // Calculate and store score in Firebase
            const score = calculateScore(location.state.incorrect, location.state.level);
            const gameResultRef = collection(db, "users", user.uid, "game3");
            try {
                await addDoc(gameResultRef, {
                    score: score,
                    level: location.state.level,
                    correct_count: location.state.correct,
                    incorrect_count: location.state.incorrect,
                    duration: location.state.duration,
                    timestamp: serverTimestamp(),
                    numbers: location.state.numbers,
                });

                // Update totalPoints in user's document
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                totalPoints: increment(score)
                });

            } catch (error) {
                console.error("Error storing score:", error);
            }
        };

        saveScore();  // Call the async function
    }, [user, location.state, navigate]);

    if (!user || !location.state) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const score = calculateScore(location.state.incorrect, location.state.level);

      // update in firebase here 

    return (
        <Box
            sx={{
                background: 'linear-gradient(180deg, #FFF5F6 0%, #FFE5E5 100%)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
            }}
        >
            <Typography variant="h4" sx={{ color: '#FF6B6B', mb: 4 }}>
                FINAL SCORE
            </Typography>

            <Typography variant="h2" sx={{ color: '#666', mb: 4 }}>
                {score} POINTS
            </Typography>

            <Typography variant="h5" sx={{ mb: 3, color: '#666' }}>
                {location.state.correct} CORRECT • {location.state.incorrect} INCORRECT
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/${location.state.uid}`)}
                    sx={{
                        borderColor: '#FF6B6B',
                        color: '#FF6B6B',
                        '&:hover': {
                            borderColor: '#FF8888',
                            backgroundColor: 'rgba(255,107,107,0.1)',
                        },
                    }}
                >
                    Exit Game
                </Button>
                <Button
                    variant="contained"
                    onClick={() => navigate(`/reach-and-recall/${location.state.uid}/home-page`)}
                    sx={{
                        backgroundColor: '#FF6B6B',
                        '&:hover': {
                            backgroundColor: '#FF8888',
                        },
                    }}
                >
                    Play Again
                </Button>
            </Box>
        </Box>
    );
};

export default FinalScore; 