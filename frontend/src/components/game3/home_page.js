import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const ReachAndRecallLevelsPage = () => {
    const navigate = useNavigate();
    const { uid } = useParams();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            if (user.uid !== uid) {
                navigate(`/reach-and-recall/${user.uid}/home-page`);
                return;
            }

            try {
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const level = userData?.level;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
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
                onClick={() => navigate(`/reach-and-recall/${uid}/memorize/level/${level}`)}
            >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Start Game
                </Typography>
                <Typography variant="body1" sx={{ textAlign: "center", color: "#555" }}>
                    Click to begin the Reach & Recall memory challenge! 
                    {/* TODO: Instructions */}
                </Typography>
            </Box>
        </Box>
    );
};

export default ReachAndRecallLevelsPage;
