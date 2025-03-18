import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

function ArduinoTest() {
    const [sensorData, setSensorData] = useState({
        leftSensor: 0.00,
        rightSensor: 0.00,
        status: 'Disconnected'
    });

    useEffect(() => {
        // Set up polling interval
        const interval = setInterval(() => {
            fetchSensorData();
        }, 100); // Poll every 100ms

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const fetchSensorData = async () => {
        try {
            const response = await fetch('http://localhost:8000/sensor-data');
            const data = await response.json();
            console.log('Received data:', data); // Debug log
            
            setSensorData({
                leftSensor: data.left ?? 0.00,
                rightSensor: data.right ?? 0.00,
                status: data.connected ? 'Connected' : 'Disconnected'
            });
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            setSensorData(prev => ({ ...prev, status: 'Error' }));
        }
    };

    // Safely format numbers with fallback to 0.00
    const formatNumber = (num) => {
        return (typeof num === 'number' ? num : 0.00).toFixed(2);
    };

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
                    <Typography variant="subtitle1" color={sensorData.status === 'Connected' ? 'success.main' : 'error.main'}>
                        Status: {sensorData.status === 'Connected' ? '🟢 Connected' : '🔴 Disconnected'}
                    </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Force Readings:
                    </Typography>
                    <Typography>
                        Left Sensor: {formatNumber(sensorData.leftSensor)}
                    </Typography>
                    <Typography>
                        Right Sensor: {formatNumber(sensorData.rightSensor)}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default ArduinoTest; 