import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

function ArduinoTest() {
    const [isConnected, setIsConnected] = useState(false);
    const [forceData, setForceData] = useState({
        left: 0,
        right: 0,
        status: null,
        error: null
    });

    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            try {
                console.log('Fetching sensor data...');
                const response = await axios.get('http://localhost:8000/sensor-data');
                console.log('Received data:', response.data);
                
                setForceData(response.data);
                setIsConnected(true);
            } catch (error) {
                console.error('Error fetching sensor data:', error);
                setIsConnected(false);
                setForceData(prev => ({
                    ...prev,
                    error: error.message
                }));
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling every second
        intervalId = setInterval(fetchData, 1000);
        console.log('Started polling interval');

        // Cleanup
        return () => {
            console.log('Cleaning up interval');
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5'
        }}>
            <Paper elevation={3} sx={{
                p: 4,
                borderRadius: 2,
                maxWidth: 400,
                width: '100%'
            }}>
                <Typography variant="h5" gutterBottom>
                    Arduino Force Sensor Test
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" color={isConnected ? 'success.main' : 'error.main'}>
                        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Force Readings:
                    </Typography>
                    <Typography>
                        Left Sensor: {forceData.left?.toFixed(2) || 0}
                    </Typography>
                    <Typography>
                        Right Sensor: {forceData.right?.toFixed(2) || 0}
                    </Typography>
                    {forceData.error && (
                        <Typography color="error.main" sx={{ mt: 2 }}>
                            Error: {forceData.error}
                        </Typography>
                    )}
                    {forceData.status && (
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                            Status: {forceData.status}
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default ArduinoTest; 