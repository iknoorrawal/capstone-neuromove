import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Typography, Box } from "@mui/material";

const ReachAndRecallMemorize = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState(null);
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/get-number");
                setData(response.data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (countdown <= 0) {
            handleRunScript();
            return;
        }
    
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    
        return () => clearInterval(timer);
    }, [countdown]);
    
    const handleRunScript = async () => {
        if (!data) return;

        try {
            const response = await axios.post("http://127.0.0.1:8000/run-script", {
                number1: data.number1,
                number2: data.number2
            });

            setOutput(response.data.message || "Script started successfully!");
            setError(null);
        } catch (err) {
            setError("Failed to start script: " + err.message);
            setOutput(null);
        }
    };

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    if (!data) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
            }}
        >
            <Typography variant="h4" gutterBottom>
                Please memorize these 2 numbers
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                {data.number1} and {data.number2}
            </Typography>

            <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
                <CircularProgress 
                    variant="determinate" 
                    value={(countdown / 15) * 100} 
                    size={80} 
                    thickness={5}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h6">{countdown}</Typography>
                </Box>
            </Box>

            <Typography variant="body1" color="textSecondary">
                The game will start automatically in {countdown} seconds.
            </Typography>

            {output && (
                <Typography variant="body1" sx={{ mt: 3, color: "green" }}>
                    {output}
                </Typography>
            )}
        </Box>
    );
};

export default ReachAndRecallMemorize;
