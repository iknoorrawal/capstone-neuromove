import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Neuromove</h1>
      <button onClick={() => navigate("/signup")}>Go to Signup</button>
      <button onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );
};

export default Home;
