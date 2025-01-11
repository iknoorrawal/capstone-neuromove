import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Typography, CircularProgress, Button } from "@mui/material";

const Dashboard = () => {
  const { uid } = useParams(); // UID from URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (user.uid !== uid) {
        navigate(`/dashboard/${user.uid}`);
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
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 5, textAlign: "center" }}>
      {userData ? (
        <>
          <Typography variant="h4">Welcome, {userData.firstName} {userData.lastName}!</Typography>
          <Typography variant="body1">Email: {userData.email}</Typography>
          <Typography variant="body1">Date of Birth: {userData.dob}</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            sx={{ mt: 3 }} 
            onClick={() => {
              auth.signOut();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <Typography variant="h5">Loading...</Typography>
      )}
    </Box>
  );
};

export default Dashboard;
