import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { IoStar } from "react-icons/io5";

const FinalScore = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!user) {
            return; // Don't navigate immediately, wait for user to load
        }
        
        if (!location.state) {
            navigate(`/reach-and-recall/${user.uid}/home-page`);
            return;
        }
        
        // Verify the score belongs to this user
        if (location.state.uid !== user.uid) {
            navigate(`/reach-and-recall/${user.uid}/home-page`);
            return;
        }
    }, [user, location.state, navigate]);

    // Add loading state
    if (!user || !location.state) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    const { correct, incorrect, duration } = location.state || { correct: 0, incorrect: 0, duration: 0 };

    // Calculate number of gold stars based on incorrect attempts
    const getGoldStars = (incorrect) => {
        if (incorrect === 0) return 5;
        if (incorrect === 1) return 4;
        if (incorrect < 4) return 3;
        if (incorrect < 10) return 2;
        return 1;
    };

    const goldStars = getGoldStars(incorrect);

    const handleExitGame = () => {
        navigate(`/dashboard/${location.state.uid}`);
    };

    const handlePlayAgain = () => {
        navigate(`/reach-and-recall/${location.state.uid}/home-page`);
    };

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
            <Typography variant="h3" sx={{ color: '#FF6B6B', mb: 4 }}>
                FINAL SCORE
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <IoStar
                        key={star}
                        size={50}
                        color={star <= goldStars ? "#FFB800" : "#D3D3D3"}
                        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' }}
                    />
                ))}
            </Box>

            <Typography variant="h5" sx={{ mb: 3, color: '#666' }}>
                {correct} CORRECT • {incorrect} INCORRECT
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handleExitGame}
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
                    onClick={handlePlayAgain}
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