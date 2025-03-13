import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const BalanceQuestLevelsPage = ({ user }) => {
    const navigate = useNavigate();
    const [levelStatus, setLevelStatus] = useState({
        1: { unlocked: true }, // Level 1 always unlocked
        2: { unlocked: false },
        3: { unlocked: false }
    });
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const checkLevelAccess = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const unlockedLevels = userData.unlockedLevels || [1];
                    
                    const newLevelStatus = {
                        1: { unlocked: true },
                        2: { unlocked: unlockedLevels.includes(2) },
                        3: { unlocked: unlockedLevels.includes(3) }
                    };
                    setLevelStatus(newLevelStatus);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error checking level access:", error);
                setLoading(false);
            }
        };

        checkLevelAccess();
    }, [user, navigate]);

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

    return (
        <Box sx={{
            minHeight: "100vh",
            p: 4,
            background: "#fff",
        }}>
            {/* Logo and Header */}
            <Box sx={{ 
                display: "flex",
                flexDirection: "column",
                mb: 3,
            }}>
                <Typography 
                    variant="h6" 
                    component="div" 
                    onClick={() => navigate(`/dashboard/${user.uid}`)}
                    sx={{ 
                        cursor: 'pointer',
                        fontWeight: 'medium',
                        mb: 2,
                        '&:hover': {
                            opacity: 0.8
                        }
                    }}
                >
                    N E U R O M O V E
                </Typography>
                <Typography variant="h3" sx={{ 
                    color: "#E67A26",
                    fontWeight: "medium"
                }}>
                    Balance Quest
                </Typography>
            </Box>

            <Box sx={{ 
                display: "flex",
                gap: 6,
            }}>
                {/* Left Column - Game Info */}
                <Box sx={{ flex: 1 }}>
                    {/* Overview Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Overview</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Strengthen your balance and sharping your mind by switching feet to sort the items right.
                        </Typography>
                    </Box>

                    {/* Set up Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Set up</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Place your feet on the mat. You can play while standing or seated for more stability.
                        </Typography>
                    </Box>

                    {/* Play Time Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Play Time</Typography>
                        <Typography variant="body1" color="text.secondary">
                            ~ 5 minutes
                        </Typography>
                    </Box>

                    {/* Warnings Section */}
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 3,
                            position: 'relative',
                            width: '100%'
                        }}>
                            <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <WarningIcon sx={{ color: '#FFA726' }} />
                                <Typography variant="h6">WARNINGS</Typography>
                            </Box>
                            <Box sx={{
                                width: '100%',
                                height: '1px',
                                bgcolor: '#E0E0E0',
                                mt: 1
                            }} />
                        </Box>

                        <Box>
                            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>Fall Risk</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Be cautious while standing. Ensure you are in a safe environment with enough space to move freely.
                            </Typography>

                            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>Risk of Anxiety or Frustration</Typography>
                            <Typography variant="body1" color="text.secondary">
                            If you experience anxiety or frustration, take a break and speak to your physiotherapist.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right Column - Level Selection */}
                <Box sx={{ 
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                    {/* Character Image */}
                    <Box
                        sx={{
                            width: '100%',
                            height: 350,
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #E67A26 0%, #FFB74D 100%)',
                            mb: 3,
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* Green checkmark in top-right */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                bgcolor: '#4CAF50',
                                borderRadius: '50%',
                                p: 0.5
                            }}
                        >
                            <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>

                        {/* Character icon */}
                        <Box
                            component="img"
                            src="/balancequest.png"
                            alt="Balance Quest Character"
                            sx={{
                                width: '50%',
                                height: 'auto',
                                filter: 'brightness(0) invert(1)', // Makes the image white
                            }}
                        />
                    </Box>

                    {/* Level Selection */}
                    <Box sx={{ 
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                        mb: 4,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        {[1, 2, 3].map((level) => (
                            <Box
                                key={level}
                                onClick={() => levelStatus[level].unlocked && setSelectedLevel(level)}
                                sx={{
                                    width: 'calc((100% - 16px) / 3)', // Account for gaps between boxes
                                    height: 120,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid',
                                    borderColor: selectedLevel === level ? '#E67A26' : '#E0E0E0',
                                    borderRadius: 2,
                                    cursor: levelStatus[level].unlocked ? 'pointer' : 'default',
                                    bgcolor: selectedLevel === level ? 'rgba(230, 122, 38, 0.05)' : 'white',
                                    position: 'relative',
                                    '&:hover': levelStatus[level].unlocked ? {
                                        borderColor: '#E67A26',
                                        bgcolor: 'rgba(230, 122, 38, 0.05)',
                                    } : {}
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        color: levelStatus[level].unlocked ? 
                                            (selectedLevel === level ? '#E67A26' : '#666') : 
                                            '#E0E0E0',
                                        mb: 1
                                    }}
                                >
                                    {level}
                                </Typography>
                                {!levelStatus[level].unlocked && (
                                    <LockIcon 
                                        sx={{ 
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            color: '#E0E0E0'
                                        }} 
                                    />
                                )}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: selectedLevel === level ? '#E67A26' : 'text.secondary',
                                        textAlign: 'center'
                                    }}
                                >
                                    {levelStatus[level].unlocked ? 
                                        `Level ${level}` : 
                                        `Complete Level ${level-1} to Unlock`}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Play Now Button */}
                    <Button
                        variant="contained"
                        disabled={!selectedLevel}
                        onClick={() => navigate(`/balance-quest/${user.uid}/game/level/${selectedLevel}`)}
                        sx={{
                            width: '100%',
                            py: 2,
                            borderRadius: 8,
                            bgcolor: '#E67A26',
                            '&:hover': {
                                bgcolor: '#D35F00',
                            },
                            '&.Mui-disabled': {
                                bgcolor: '#E0E0E0',
                            }
                        }}
                    >
                        Play Now
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default BalanceQuestLevelsPage;
