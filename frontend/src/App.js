
// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Profile from "./components/profile";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define the routes for your pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:uuid" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
