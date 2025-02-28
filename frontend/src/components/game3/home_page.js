import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

const ReachAndRecallLevelsPage = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const updateUserData = async () => {
            try {
                if (!user) {
                    navigate('/login');
                    return;
                }

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const currentTime = new Date();

                    // Initialize streaks and lastLogin if they don't exist
                    const lastLogin = userData.lastLogin ? userData.lastLogin.toDate() : currentTime;
                    const currentStreak = userData.streaks || 0;

                    const timeDifference = (currentTime - lastLogin) / (1000 * 60 * 60); // Convert to hours

                    let updatedStreak = currentStreak;

                    if (timeDifference >= 24 && timeDifference <= 48) {
                        updatedStreak += 1;
                    } else if (timeDifference > 48) {
                        updatedStreak = 0;
                    }

                    await updateDoc(userRef, {
                        streaks: updatedStreak,
                        lastLogin: Timestamp.fromDate(currentTime),
                    });
                }
            } catch (error) {
                console.error("Error updating user data:", error);
            } finally {
                setLoading(false);
            }
        };

        updateUserData();
    }, [user, navigate]);

    const handleStartGame = (level) => {
        navigate(`/reach-and-recall/${user.uid}/instructions/level/${level}`);
    };

    if (loading) {
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

    if (!user) {
        return null;
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
            position: "relative"
        }}>
            <Button
                onClick={() => navigate(`/dashboard/${user.uid}`)}
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    backgroundColor: '#d63384',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#c02674',
                    },
                    zIndex: 10
                }}
            >
                Exit Game
            </Button>

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
