import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const ReachAndRecallLevelsPage = ({ user }) => {
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
                    where("incorrect_count", "==", 0),
                    limit(1)
                );

                const level1Snapshot = await getDocs(level1Query);
                
                if (!level1Snapshot.empty) {
                    newLevelStatus[2].unlocked = true;

                    const level2Query = query(
                        gameRef,
                        where("level", "==", 2),
                        where("incorrect_count", "==", 0),
                        limit(1)
                    );

                    const level2Snapshot = await getDocs(level2Query);
                    
                    if (!level2Snapshot.empty) {
                        newLevelStatus[3].unlocked = true;
                    }
                }

                setLevelStatus(newLevelStatus);
                setLoading(false);
            } catch (error) {
                console.error("Error checking level access:", error);
                setLoading(false);
            }
        };

        checkLevelAccess();
    }, [user, navigate]);

    const handleStartGame = () => {
        if (selectedLevel && levelStatus[selectedLevel].unlocked) {
            navigate(`/reach-and-recall/${user.uid}/instructions/level/${selectedLevel}`);
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
                    color: "#C1436D",
                    fontWeight: "medium"
                }}>
                    Reach & Recall
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
                            Stretch, reach, and recall patterns to strengthen your memory, enhance focus, and improve physical coordination.
                        </Typography>
                    </Box>

                    {/* Set up Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Set up</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Ensure you are standing ~3 feet away from the camera.
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

                            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>Space Warning</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Make sure there is enough room around you to move safely and avoid bumping into objects.
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
                            background: 'linear-gradient(135deg, #F46895 0%, #F8BBD0 100%)',
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
                                    borderColor: selectedLevel === level ? '#C1436D' : '#E0E0E0',
                                    borderRadius: 2,
                                    cursor: levelStatus[level].unlocked ? 'pointer' : 'default',
                                    bgcolor: selectedLevel === level ? 'rgba(193, 67, 109, 0.05)' : 'white',
                                    position: 'relative',
                                    '&:hover': levelStatus[level].unlocked ? {
                                        borderColor: '#C1436D',
                                        bgcolor: 'rgba(193, 67, 109, 0.05)',
                                    } : {}
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        color: levelStatus[level].unlocked ? 
                                            (selectedLevel === level ? '#C1436D' : '#666') : 
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
                                        color: selectedLevel === level ? '#C1436D' : 'text.secondary',
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
                        onClick={handleStartGame}
                        sx={{
                            width: '100%',
                            py: 2,
                            borderRadius: 8,
                            bgcolor: '#4A90E2',
                            '&:hover': {
                                bgcolor: '#357ABD',
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

export default ReachAndRecallLevelsPage;
