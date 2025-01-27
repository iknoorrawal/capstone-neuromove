import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const ReachAndRecallLevelsPage = ({ user }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const handleStartGame = () => {
        const level = user?.level || 1;
        navigate(`/reach-and-recall/${user.uid}/memorize/level/${level}`);
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

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
        }}>
            <Box
                sx={{
                    backgroundColor: "#F0F0F0",
                    borderRadius: 3,
                    p: 3,
                    maxWidth: 350,
                    minHeight: 180,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.05)",
                    },
                }}
                onClick={handleStartGame}
            >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Start Game
                </Typography>
                <Typography variant="body1" sx={{ textAlign: "center", color: "#555" }}>
                    Click to begin the Reach & Recall memory challenge!
                </Typography>
            </Box>
        </Box>
    );
};

export default ReachAndRecallLevelsPage;
