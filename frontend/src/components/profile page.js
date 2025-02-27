import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { TextField, Button, Box, Typography } from "@mui/material";

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    physioContact: {
      name: "",
      email: "",
      phoneNumber: "",
      clinic: "",
    },
    emergencyContact: {
      name: "",
      email: "",
      phoneNumber: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData((prev) => ({
            ...prev,
            ...userSnap.data(),
            physioContact: userSnap.data().physioContact || prev.physioContact,
            emergencyContact: userSnap.data().emergencyContact || prev.emergencyContact,
          }));
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e, category) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: value },
    }));
  };

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, userData);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (loading) return <Typography>Loading profile...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 5 }}>
      <Typography variant="h4" mb={3}>Profile</Typography>
      
      <TextField fullWidth label="First Name" name="firstName" margin="normal" value={userData.firstName} onChange={handleChange} />
      <TextField fullWidth label="Last Name" name="lastName" margin="normal" value={userData.lastName} onChange={handleChange} />
      <TextField fullWidth label="Date of Birth" type="date" name="dob" InputLabelProps={{ shrink: true }} margin="normal" value={userData.dob} onChange={handleChange} />
      <TextField fullWidth label="Email" name="email" margin="normal" value={userData.email} disabled />

      {/* Physio Contact Section */}
      <Typography variant="h6" mt={3}>Physiotherapist Contact</Typography>
      <TextField fullWidth label="Name" name="name" margin="normal" value={userData.physioContact.name} onChange={(e) => handleNestedChange(e, "physioContact")} />
      <TextField fullWidth label="Email" name="email" margin="normal" value={userData.physioContact.email} onChange={(e) => handleNestedChange(e, "physioContact")} />
      <TextField fullWidth label="Phone Number" name="phoneNumber" margin="normal" value={userData.physioContact.phoneNumber} onChange={(e) => handleNestedChange(e, "physioContact")} />
      <TextField fullWidth label="Clinic" name="clinic" margin="normal" value={userData.physioContact.clinic} onChange={(e) => handleNestedChange(e, "physioContact")} />

      {/* Emergency Contact Section */}
      <Typography variant="h6" mt={3}>Emergency Contact</Typography>
      <TextField fullWidth label="Name" name="name" margin="normal" value={userData.emergencyContact.name} onChange={(e) => handleNestedChange(e, "emergencyContact")} />
      <TextField fullWidth label="Email" name="email" margin="normal" value={userData.emergencyContact.email} onChange={(e) => handleNestedChange(e, "emergencyContact")} />
      <TextField fullWidth label="Phone Number" name="phoneNumber" margin="normal" value={userData.emergencyContact.phoneNumber} onChange={(e) => handleNestedChange(e, "emergencyContact")} />

      {error && <Typography color="error" mt={2}>{error}</Typography>}
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleUpdate}>Update Profile</Button>
    </Box>
  );
};

export default Profile;
