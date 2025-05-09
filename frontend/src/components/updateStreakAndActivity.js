// src/utils/streakTracker.js
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Updates a user's streak and weekly login tracking
 * This function should be called when a user completes gameplay activities
 * 
 * @param {Object} db - Firestore database reference
 * @param {string} userId - User ID from Firebase Authentication
 * @param {number} additionalPoints - Optional points to add for the activity (default: 0)
 * @returns {Promise<Object>} Updated user data including streak, points, and rank information
 */
export const updateStreakAndActivity = async (db, userId, additionalPoints = 0) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found in Firestore");
    }

    const userData = userSnap.data();

    // Get current date in user's local timezone
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayISO = today.toISOString().split('T')[0];

    // Calculate the current week's Monday
    const currentWeekMonday = new Date(today);
    const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7
    currentWeekMonday.setDate(today.getDate() - (dayOfWeek - 1));
    const currentWeekMondayISO = currentWeekMonday.toISOString().split('T')[0];

    // Initialize or get existing weekly login data
    let updatedWeeklyLogins = userData.weeklyLogins || {};

    // Check if we need to reset weekly tracking (new week has started)
    if (!updatedWeeklyLogins.weekStartDate || 
        updatedWeeklyLogins.weekStartDate !== currentWeekMondayISO) {
      // Reset weekly tracking for new week
      updatedWeeklyLogins = {
        weekStartDate: currentWeekMondayISO,
        daysLoggedIn: {}
      };
    }

    // Check if already logged in today to avoid duplicate streak counts
    const alreadyLoggedToday = updatedWeeklyLogins.daysLoggedIn[todayISO];

    // Mark today as logged in
    updatedWeeklyLogins.daysLoggedIn[todayISO] = true;

    // Update streak logic
    const lastLoginDate = userData.lastLoginDate ? new Date(userData.lastLoginDate) : null;
    let updatedStreak = userData.currentStreak || 0;

    // Calculate yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    if (!lastLoginDate) {
      // First time login
      updatedStreak = 1;
    } else if (todayISO === lastLoginDate.toISOString().split('T')[0]) {
      // Already logged in today, don't update streak
    } else if (yesterdayISO === lastLoginDate.toISOString().split('T')[0]) {
      // Logged in yesterday, increase streak
      updatedStreak += 1;
    } else {
      // Missed a day, reset streak
      updatedStreak = 1;
    }

    // Update points logic - now using totalPoints
    let updatedTotalPoints = userData.totalPoints || 0;

    // Add any additional points from the activity
    updatedTotalPoints += additionalPoints;

    // Check if all 7 days of the current week have been logged in
    // Only award if this completes the week and all previous days were logged in
    if (Object.keys(updatedWeeklyLogins.daysLoggedIn).length === 7) {
      // Check that all days of the week are present
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekMonday);
        day.setDate(currentWeekMonday.getDate() + i);
        weekDays.push(day.toISOString().split('T')[0]);
      }

      const allDaysPresent = weekDays.every(day => updatedWeeklyLogins.daysLoggedIn[day]);

      if (allDaysPresent && !updatedWeeklyLogins.weeklyRewardClaimed) {
        updatedTotalPoints += 300;
        updatedWeeklyLogins.weeklyRewardClaimed = true;
      }
    }

    // Check for streak milestones (example: 7, 30, 100 days)
    const milestones = [7, 30, 100];
    const reachedMilestones = userData.reachedMilestones || [];
    let newMilestonesReached = false;

    for (const milestone of milestones) {
      if (updatedStreak === milestone && !reachedMilestones.includes(milestone)) {
        // Award points for reaching milestone
        updatedTotalPoints += 300;

        // Add to reached milestones
        reachedMilestones.push(milestone);
        newMilestonesReached = true;
      }
    }

    // Prepare update data
    const updateData = {
      weeklyLogins: updatedWeeklyLogins,
      currentStreak: updatedStreak,
      lastLoginDate: todayISO,
      totalPoints: updatedTotalPoints
    };

    // Add reached milestones if there are new ones
    if (newMilestonesReached) {
      updateData.reachedMilestones = reachedMilestones;
    }

    // Get previous rank before updating points
    const prevRank = userData.currentRank || getUserRank(userData.totalPoints || 0).name;

    // Calculate user's rank based on updated points
    const rankObj = getUserRank(updatedTotalPoints);

    // Determine next rank
    const nextRankObj = getNextRank(rankObj);

    // Check if user has ranked up
    let hasRankedUp = false;
    if (prevRank !== rankObj.name) {
      // User has ranked up!
      hasRankedUp = true;
      updateData.currentRank = rankObj.name;
    }

    // Update Firestore with all changes
    await updateDoc(userRef, updateData);

    // Return updated data for UI updates
    return {
      weeklyLogins: updatedWeeklyLogins,
      currentStreak: updatedStreak,
      totalPoints: updatedTotalPoints,
      currentRank: rankObj,
      nextRank: nextRankObj,
      hasRankedUp,
      newRankName: rankObj.name,
      alreadyLoggedToday
    };
  } catch (error) {
    console.error("Error updating streak and activity:", error);
    throw error;
  }
};

// Define rank thresholds and information - copied from Dashboard to make the utility self-contained
const RANKS = [
  { name: "Wanderer", threshold: 0, icon: "ExploreIcon", color: "#8D6E63" },
  { name: "Scout", threshold: 1500, icon: "MapIcon", color: "#78909C" },
  { name: "Explorer", threshold: 3000, icon: "SearchIcon", color: "#43A047" },
  { name: "Treasure Seeker", threshold: 5000, icon: "SearchIcon", color: "#FFA000" },
  { name: "Pioneer", threshold: 8000, icon: "EmojiFlagsIcon", color: "#5C6BC0" },
  { name: "Trailblazer", threshold: 10000, icon: "RouteIcon", color: "#D81B60" },
];

// Function to determine user's rank based on points
export const getUserRank = (points) => {
  // Find the highest rank the user qualifies for
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].threshold) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // Default to lowest rank
};

// Function to find the next rank
export const getNextRank = (currentRank) => {
  const currentIndex = RANKS.findIndex(rank => rank.name === currentRank.name);
  if (currentIndex < RANKS.length - 1) {
    return RANKS[currentIndex + 1];
  }
  return null; // No higher rank available
};

// Helper function to get the icon component based on icon name
export const getRankIconComponent = (iconName) => {
  return iconName;
};

// Export RANKS for use in components
export { RANKS };
