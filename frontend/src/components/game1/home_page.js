import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Card, Button } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';

const BalanceQuestLevelsPage = () => {
    const navigate = useNavigate();
    const { uid } = useParams();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [levelStatus, setLevelStatus] = useState({
        1: { unlocked: true },
        2: { unlocked: false },
        3: { unlocked: false }
    });

    const levels = [
        {
            level: 1,
            title: "Beginner",
            description: "10 items • 10s memorize • 15s decide",
            color: "#E67A26"
        },
        {
            level: 2,
            title: "Intermediate",
            description: "12 items • 10s memorize • 10s decide",
            color: "#369B9F"
        },
        {
            level: 3,
            title: "Advanced",
            description: "15 items • 10s memorize • 5s decide",
            color: "#F46895"
        }
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            if (user.uid !== uid) {
                navigate(`/balance-quest/${user.uid}/home-page`);
                return;
            }

            try {
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserData(userData);
                    
                    // Get unlocked levels from Firebase
                    const unlockedLevels = userData.unlockedLevels || [1];
                    console.log("Unlocked levels from Firebase:", unlockedLevels);
                    
                    // Update level status based on Firebase data
                    const newLevelStatus = {};
                    levels.forEach(level => {
                        newLevelStatus[level.level] = {
                            unlocked: unlockedLevels.includes(level.level)
                        };
                    });
                    setLevelStatus(newLevelStatus);
                } else {
                    console.log("User not found in Firestore");
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [uid, navigate]);

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

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            padding: 4,
            background: "linear-gradient(to bottom right, #FDE3C3, #FFF2E5)",
            position: "relative"
        }}>
            {/* Exit Button */}
            <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/${uid}`)}
                    sx={{
                        borderColor: "#A0522D",
                        color: "#A0522D",
                        "&:hover": {
                            borderColor: "#8B4513",
                            backgroundColor: "rgba(160, 82, 45, 0.1)"
                        }
                    }}
                >
                    Exit to Dashboard
                </Button>
            </Box>

            <Typography variant="h3" sx={{ mb: 2, color: "#A0522D", fontWeight: "bold" }}>
                Balance Quest
            </Typography>

            <Typography variant="body1" sx={{ 
                mb: 4, 
                color: "#333", 
                textAlign: "center",
                maxWidth: "600px",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)"
            }}>
                Memorize a set of items that belong to one category,
                then quickly identify whether new items belong to that same category. The faster and more accurate
                you are, the higher your score.
            </Typography>
            
            <Box sx={{ width: "100%", maxWidth: "800px" }}>
                {levels.map((level) => (
                    <Box
                        key={level.level}
                        sx={{
                            mb: 3,
                            transition: "transform 0.3s ease-in-out",
                            "&:hover": levelStatus[level.level].unlocked ? {
                                transform: "scale(1.02)"
                            } : undefined
                        }}
                    >
                        <Card
                            onClick={() => {
                                if (levelStatus[level.level].unlocked) {
                                    navigate(`/balance-quest/${uid}/game/level/${level.level}`);
                                }
                            }}
                            sx={{
                                background: levelStatus[level.level].unlocked 
                                    ? `linear-gradient(135deg, ${level.color}, ${level.color}CC)`
                                    : `linear-gradient(135deg, #808080, #A0A0A0)`,
                                borderRadius: 3,
                                p: 3,
                                minHeight: "100px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: levelStatus[level.level].unlocked ? "pointer" : "not-allowed",
                                transition: "box-shadow 0.3s ease-in-out",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                "&:hover": levelStatus[level.level].unlocked ? {
                                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
                                } : undefined,
                                color: "white",
                                opacity: levelStatus[level.level].unlocked ? 1 : 0.7
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="h4" sx={{ mr: 3, fontWeight: "bold" }}>
                                    Level {level.level}
                                </Typography>
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {level.title}
                                    </Typography>
                                    <Typography variant="body1">
                                        {level.description}
                                    </Typography>
                                    {!levelStatus[level.level].unlocked && (
                                        <Typography variant="body2" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.8)" }}>
                                            {level.level === 1 ? "Start here" : 
                                             `Complete Level ${level.level - 1} with a perfect score to unlock`}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.2)"
                            }}>
                                {levelStatus[level.level].unlocked ? (
                                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                        {level.level}
                                    </Typography>
                                ) : (
                                    <LockIcon sx={{ fontSize: 30 }} />
                                )}
                            </Box>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default BalanceQuestLevelsPage;
