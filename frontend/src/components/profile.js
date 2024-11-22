import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { auth } from "../firebase";

const Profile = () => {
  const { uuid } = useParams(); // Extract the UUID from the route
  const [isAuthorized, setIsAuthorized] = useState(null); // Track authorization status
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      if (auth.currentUser.uid === uuid) {
        setEmail(auth.currentUser.email);
        setIsAuthorized(true); // User is authorized
      } else {
        setIsAuthorized(false); // User is unauthorized
      }
    } else {
      setIsAuthorized(false); // No logged-in user
    }
  }, [uuid]);

  // Render a 404 page if not authorized
  if (isAuthorized === false) {
    return <Navigate to="/404" />;
  }

  // Wait for authorization check to complete
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Your Profile</h1>
      <p>Hi {email}!</p>
      <p>Your unique ID is: {uuid}</p>
    </div>
  );
};

export default Profile;
