// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import ReachAndRecallLevelsPage from "./components/game3/home_page";
import ReachAndRecallMemorize from "./components/game3/memorize_numbers";
import BalanceQuest from "./components/game1/game_logic";
import FinalScore from './components/game3/final_score';
import BalanceQuestLevelsPage from "./components/game1/home_page";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          if (userDoc.exists()) {
            setUser({ ...authUser, ...userDoc.data() });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Define the routes for your pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/:uid" element={<Dashboard user={user} />} />
        <Route path="/reach-and-recall/:uid/home-page" element={<ReachAndRecallLevelsPage user={user} />} />
        <Route path="/reach-and-recall/:uid/memorize/level/:level" element={<ReachAndRecallMemorize user={user} />} />
        <Route path="/reach-and-recall/:uid/final-score" element={<FinalScore user={user} />} />
        <Route path="/balance-quest/:uid/home-page" element={<BalanceQuestLevelsPage user={user} />} />
        <Route path="/balance-quest/:uid/game/level/:level" element={<BalanceQuest user={user} />} />
      </Routes>
    </Router>   
  );
};

export default App;
