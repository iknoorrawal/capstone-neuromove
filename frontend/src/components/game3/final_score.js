import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Container, Paper } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { calculateScore } from './game_config';
import updateStreakAndActivity from "../updateStreakAndActivity";


function getStarsAndPoints(incorrect, level) {
    const score = calculateScore(incorrect, level);
    // Adjust star logic based on score ranges for game 3
    if (score >= 450) {
        return { stars: 5, points: score };
    } else if (score >= 350) {
        return { stars: 4, points: score };
    } else if (score >= 250) {
        return { stars: 3, points: score };
    } else if (score >= 150) {
        return { stars: 2, points: score };
    } else {
        return { stars: 1, points: score };
    }
}

function renderStars(numStars, totalStars = 5) {
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
        const color = i <= numStars ? "#FFA800" : "#ccc";
        stars.push(
            <span
                key={i}
                style={{
                    fontSize: "3rem",
                    color: color,
                    margin: "0 8px"
                }}
            >
                ★
            </span>
        );
    }
    return <div style={{ margin: "20px 0" }}>{stars}</div>;
}

const FinalScore = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const saveScore = async () => {
            if (!user || !location.state) return;
            
            if (location.state.uid !== user.uid) {
                navigate(`/reach-and-recall/${user.uid}/home-page`);
                return;
            }

            const gameResultRef = collection(db, "users", user.uid, "game3");
            try {
                await addDoc(gameResultRef, {
                    score: calculateScore(location.state.incorrect, location.state.level),
                    level: location.state.level,
                    correct_count: location.state.correct,
                    incorrect_count: location.state.incorrect,
                    duration: location.state.duration,
                    timestamp: serverTimestamp(),
                    numbers: location.state.numbers
                });
                
                // Update streak and activity with the points earned from this game
                const streakResult = await updateStreakAndActivity(db, user.uid, calculateScore(location.state.incorrect, location.state.level),);
                console.log('Streak update result:', streakResult);

                // Check if the user ranked up
                if (streakResult.hasRankedUp) {
                    console.log(`User ranked up to ${streakResult.newRankName}!`);
                    // You could store this information to show a rank-up notification
                }
                
            } catch (error) {
                console.error("Error storing score:", error);
            }
        };

        saveScore();
    }, [user, location.state, navigate]);

    if (!user || !location.state) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const { stars, points } = getStarsAndPoints(location.state.incorrect, location.state.level);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #FFF5F6 0%, #FFE5E5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        textAlign: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.9)"
                    }}
                >
                    <Typography variant="h3" sx={{ color: "#FF6B6B", fontWeight: "bold", mb: 4 }}>
                        FINAL SCORE
                    </Typography>

                    {renderStars(stars, 5)}

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                            {location.state.correct} CORRECT &nbsp;•&nbsp; {location.state.incorrect} INCORRECT
                        </Typography>

                        <Typography variant="h4" sx={{ color: "#FF6B6B", fontWeight: "bold" }}>
                            +{points} Points
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/dashboard/${location.state.uid}`)}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderColor: "#FF6B6B",
                                color: "#FF6B6B",
                                borderRadius: 2,
                                "&:hover": {
                                    borderColor: "#FF8888",
                                    backgroundColor: "rgba(255,107,107,0.1)"
                                }
                            }}
                        >
                            Exit Game
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => navigate(`/reach-and-recall/${location.state.uid}/home-page`)}
                            sx={{
                                px: 4,
                                py: 1.5,
                                backgroundColor: "#FF6B6B",
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: "#FF8888"
                                }
                            }}
                        >
                            Play Again
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default FinalScore; 