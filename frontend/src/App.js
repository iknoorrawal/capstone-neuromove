
// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import ReachAndRecallLevelsPage from "./components/game3/home_page"
import ReachAndRecallMemorize from "./components/game3/memorize_numbers"
import BalanceQuest from "./components/game1/game_logic"




const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define the routes for your pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/:uid" element={<Dashboard />} />
        <Route path="/reach-and-recall/:uid/home-page" element={<ReachAndRecallLevelsPage />} />
        <Route path="/reach-and-recall/:uid/memorize/level/:level" element={<ReachAndRecallMemorize />} />
        <Route path="/game1-test" element={<BalanceQuest />} />
      </Routes>
    </Router>   
  );
};

export default App;
