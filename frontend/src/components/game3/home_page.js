import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const ReachAndRecallLevelsPage = ({ user }) => {
    const navigate = useNavigate();
    const [levelStatus, setLevelStatus] = useState({
        1: { unlocked: true }, // Level 1 always unlocked
        2: { unlocked: false },
        3: { unlocked: false }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const checkLevelAccess = async () => {
            try {
                const gameRef = collection(db, "users", user.uid, "game3");
                
                // Initialize with level 1 unlocked
                const newLevelStatus = {
                    1: { unlocked: true },
                    2: { unlocked: false },
                    3: { unlocked: false }
                };

                // Check for any perfect completion of level 1
                const level1Query = query(
                    gameRef,
                    where("level", "==", 1),
                    where("incorrect_count", "==", 0),  // Look for any perfect completion
                    limit(1)  // We only need to know if at least one exists
                );

                const level1Snapshot = await getDocs(level1Query);
                console.log("Level 1 has perfect completion:", !level1Snapshot.empty);
                
                // If level 1 was ever completed perfectly, unlock level 2 permanently
                if (!level1Snapshot.empty) {
                    newLevelStatus[2].unlocked = true;
                    console.log("Level 2 unlocked");

                    // Check for any perfect completion of level 2
                    const level2Query = query(
                        gameRef,
                        where("level", "==", 2),
                        where("incorrect_count", "==", 0),
                        limit(1)
                    );

                    const level2Snapshot = await getDocs(level2Query);
                    console.log("Level 2 has perfect completion:", !level2Snapshot.empty);
                    
                    // If level 2 was ever completed perfectly, unlock level 3 permanently
                    if (!level2Snapshot.empty) {
                        newLevelStatus[3].unlocked = true;
                        console.log("Level 3 unlocked");
                    }
                }

                console.log("Final level status:", newLevelStatus);
                setLevelStatus(newLevelStatus);
                setLoading(false);
            } catch (error) {
                console.error("Error checking level access:", error);
                setLoading(false);
            }
        };

        checkLevelAccess();
    }, [user, navigate]);

    const handleStartGame = (level) => {
        if (levelStatus[level].unlocked) {
            navigate(`/reach-and-recall/${user.uid}/memorize/level/${level}`);
        }
    };

    if (!user || loading) {
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
