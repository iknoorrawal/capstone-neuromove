
// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Dashboard from "./components/dashboard";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define the routes for your pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/:uid" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
