// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyAoZk7gppA0JucYxVR_5QunpN7HmZYSlKk",
  authDomain: "capstone-neuromove.firebaseapp.com",
  projectId: "capstone-neuromove",
  storageBucket: "capstone-neuromove.firebasestorage.app",
  messagingSenderId: "788820850353",
  appId: "1:788820850353:web:044e579ab8a2e2b79cd490",
  measurementId: "G-NGJ7DY5VXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
