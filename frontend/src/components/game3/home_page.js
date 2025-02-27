import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

const ReachAndRecallLevelsPage = ({ user }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const handleStartGame = (level) => {
        navigate(`/reach-and-recall/${user.uid}/instructions/level/${level}`);
       // navigate(`/reach-and-recall/${user.uid}/memorize/level/${level}`);
    };

    if (!user) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}>
                <CircularProgress />
            </Box>
        );
    }

    const levels = [
        { level: 1, description: "5 bubbles, find 2 numbers (1-20)" },
        { level: 2, description: "8 bubbles, find 3 numbers (1-50)" },
        { level: 3, description: "10 bubbles, find 4 numbers (1-100)" }
    ];

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 3,
            padding: 3,
            background: "linear-gradient(180deg, #ff9aa2 0%, #ffb1c1 100%)",
        }}>
            <Typography variant="h4" sx={{ mb: 4, color: "#fff", textAlign: "center" }}>
                Select a Level
            </Typography>

            <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 2,
                width: "100%",
                maxWidth: 400 
            }}>
                {levels.map((levelInfo) => (
                    <Button
                        key={levelInfo.level}
                        variant="contained"
                        onClick={() => handleStartGame(levelInfo.level)}
                        sx={{
                            backgroundColor: "#fff",
                            color: "#FF6B6B",
                            padding: 2,
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: "#FFE5E5",
                            },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <Typography variant="h6">
                            Level {levelInfo.level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {levelInfo.description}
                        </Typography>
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default ReachAndRecallLevelsPage;
