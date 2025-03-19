// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Signup from "./components/signup";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import ReachAndRecallLevelsPage from "./components/game3/home_page";
import ReachAndRecallMemorize from "./components/game3/memorize_numbers";
import BalanceQuest from "./components/game1/game_logic";
import FinalScore from './components/game3/final_score';
import Game1Instructions from "./components/game1/game-1-instructions/Game1Instructions";
import Game3Instructions from "./components/game3/game-3-instructions/Game3Instructions";
import BalanceQuestLevelsPage from "./components/game1/home_page";
import Settings from './components/settings';

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
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings/:uid" element={<Settings />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:uid" element={<Dashboard user={user} />} />
        <Route path="/reach-and-recall/:uid/home-page" element={<ReachAndRecallLevelsPage user={user} />} />
        <Route path="/reach-and-recall/:uid/memorize/level/:level" element={<ReachAndRecallMemorize user={user} />} />
        <Route path="/reach-and-recall/:uid/final-score" element={<FinalScore user={user} />} />
        <Route path="/reach-and-recall/:uid/instructions/level/:level" element={<Game3Instructions user={user} />} />
        <Route path="/balance-quest/:uid/home-page" element={<BalanceQuestLevelsPage user={user} />} />
        <Route path="/balance-quest/:uid/game/level/:level" element={<BalanceQuest user={user} />} />
        <Route path="/balance-quest/:uid/instructions" element={<Game1Instructions user={user} />} />
      </Routes>
    </Router>   
  );
};

export default App;
