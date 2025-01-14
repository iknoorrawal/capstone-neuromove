
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CircularProgress,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ReachAndRecallMemorize = ({ user }) => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [openConfirm, setOpenConfirm] = useState(false);

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
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleRunScript = async () => {
    if (!data) return;

    try {
      const response = await axios.post("http://127.0.0.1:8000/run-script", {
        number1: data.number1,
        number2: data.number2,
      });

      setOutput(response.data.message || "The game will begin automatically now!");
      setError(null);
    } catch (err) {
      setError("Failed to start script: " + err.message);
      setOutput(null);
    }
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmExit = () => {
    setOpenConfirm(false);
    navigate(`/reach-and-recall/${user?.uid}/home-page`);
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
        background: "linear-gradient(180deg, #ff9aa2 0%, #ffb1c1 100%)",
        height: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
        }}
      >
        <Button variant="outlined" color="#fff" onClick={handleOpenConfirm}>
          Exit Game
        </Button>
      </Box>

      {/* Confirmation dialog on exit */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Are you sure you want to exit?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmExit} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {countdown !== 0 && <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
        <CircularProgress
          variant="determinate"
          value={(countdown / 15) * 100}
          size={60}
          thickness={5}
          sx={{ color: "#369590" }}
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
        </Box>}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
        Remember the following numbers on the screen
      </Typography>

      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {[data.number1, data.number2].map((num, index) => (
          <Box
            key={index}
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" sx={{ color: "#000", fontWeight: "bold" }}>
              {num}
            </Typography>
          </Box>
        ))}
      </Box>

      {output && (
        <Typography variant="body1" sx={{ mt: 3, color: "green" }}>
          {output}
        </Typography>
      )}
    </Box>
  );
};

export default ReachAndRecallMemorize;
