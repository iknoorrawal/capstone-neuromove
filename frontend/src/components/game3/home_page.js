import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const ReachAndRecallLevelsPage = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [levelStatus, setLevelStatus] = useState({
        1: { unlocked: true },
        2: { unlocked: false },
        3: { unlocked: false }
    });

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

                    // Check for completed levels and update level status
                    const completedLevelsRef = collection(db, "completedLevels");
                    const q = query(
                        completedLevelsRef,
                        where("userId", "==", user.uid),
                        where("game", "==", "reach-and-recall"),
                        orderBy("completedAt", "desc")
                    );
                    
                    const completedLevelsSnap = await getDocs(q);
                    const newLevelStatus = { ...levelStatus };
                    
                    completedLevelsSnap.forEach((doc) => {
                        const levelData = doc.data();
                        const completedLevel = parseInt(levelData.level);
                        if (levelData.accuracy === 100) {
                            // Unlock the next level if 100% accuracy was achieved
                            if (completedLevel < 3) {
                                newLevelStatus[completedLevel + 1] = { unlocked: true };
                            }
                        }
                    });
                    
                    setLevelStatus(newLevelStatus);

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
        if (levelStatus[level].unlocked) {
            navigate(`/reach-and-recall/${user.uid}/instructions/level/${level}`);
        }
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
                        disabled={!levelStatus[levelInfo.level].unlocked}
                        sx={{
                            backgroundColor: levelStatus[levelInfo.level].unlocked ? "#fff" : "#e0e0e0",
                            color: levelStatus[levelInfo.level].unlocked ? "#FF6B6B" : "#999",
                            padding: 2,
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: levelStatus[levelInfo.level].unlocked ? "#FFE5E5" : "#e0e0e0",
                            },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            position: 'relative'
                        }}
                    >
                        <Typography variant="h6">
                            Level {levelInfo.level}
                            {!levelStatus[levelInfo.level].unlocked && 
                                <LockIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
                            }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {levelInfo.description}
                        </Typography>
                        {!levelStatus[levelInfo.level].unlocked && (
                            <Typography variant="caption" color="error">
                                {levelInfo.level === 1 ? "Start here" : 
                                 `Complete Level ${levelInfo.level - 1} with 100% accuracy to unlock`}
                            </Typography>
                        )}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default ReachAndRecallLevelsPage;
