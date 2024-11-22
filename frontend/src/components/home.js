// src/Home.js
import React from "react";
import { Link } from "react-router-dom";
import DataFetcherTest from "./testing";
import { GoogleSignupButton, GoogleLoginButton } from "./google-auth";


const Home = () => {
  return (
    <div>
      <h1>Welcome to the Homepage</h1>
      <DataFetcherTest />
      <button>
        <Link to="/signup" style={{ textDecoration: "none", color: "white" }}>
          Go to Signup
        </Link>
      </button>
      <button>
        <Link to="/login" style={{ textDecoration: "none", color: "white" }}>
          Go to Login
        </Link>
      </button>
      <div style={{ marginTop: "20px" }}>
          <GoogleSignupButton /> 
      </div>
      <div style={{ marginTop: "20px" }}>
          <GoogleLoginButton /> 
      </div>
    </div>
  );
};

export default Home