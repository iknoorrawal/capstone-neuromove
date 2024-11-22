import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate


const provider = new GoogleAuthProvider();

// Google Sign Up
const GoogleSignup = () => {
  const auth = getAuth();
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log("Signed Up User:", user);
      alert(`Signup successful! Welcome, ${user.displayName}`);
    })
    .catch((error) => {
      // Handle Errors here.
      console.error("Sign Up Error:", error.message);
      alert("Sign Up failed. Please try again.");
    });
};

const GoogleSignupButton = () => {
  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={GoogleSignup}
      style={{ marginTop: "20px" }}
    >
      Sign Up with Google
    </Button>
  );
};

// Google Login
const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(getAuth(), new GoogleAuthProvider());
      navigate(`/profile/${result.user.uid}`); // Redirect to profile with UID
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("Login with Google failed. Please try again.");
    }
  };  
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleGoogleLogin}
      style={{ marginTop: "20px" }}
    >
      Login with Google
    </Button>
  );
};

export { GoogleSignupButton, GoogleLoginButton };


