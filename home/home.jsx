import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, onAuthStateChanged } from "../../firebase";
import Navbar from "../navbar/navbar";

const Home = ({ notes }) => {
  const [username, setUsername] = useState(null);
  const [mentalStatus, setMentalStatus] = useState("Analyzing...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsername(user ? user.displayName || user.email : null);
    });
    return () => unsubscribe();
  }, []);

  // Analyze sentiment from last 5 notes
  useEffect(() => {
    if (notes.length > 0) {
      const recentNotes = notes.slice(0, 5);
      const negativeCount = recentNotes.filter((note) => note.sentiment === 0).length;
      const positiveCount = recentNotes.filter((note) => note.sentiment === 1).length;

      if (negativeCount > positiveCount) {
        setMentalStatus(
          "🚨 You have been observed feeling down recently. Try talking to our Express Chatbot."
        );
      } else {
        setMentalStatus("✅ You are mentally perfect! Keep it up. 🌟");
      }
    }
  }, [notes]);

  return (
    <div>
      <Navbar username={username} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="home-container">
        <div className="insight-card">
          <h3>Daily Motivation 🌿</h3>
          <p>"Take a deep breath. You are doing your best, and that is enough."</p>
        </div>
        <p className="mental-status">{mentalStatus}</p>
        {username ? (
          <p className="welcome-text"><b>Welcome, {username}! 🌟</b></p>
        ) : (
          <p className="welcome-text">Welcome! Take a moment to relax. 💙</p>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
