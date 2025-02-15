import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import Home from './components/home/home';
import Log from './components/log/log'; // Import Log component
import Login from './Pages/Login';
import Scene from './components/express/express';
import Signup from './Pages/Signup';

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/" && location.pathname !== "/signup";

  // 📝 Create a shared state for notes
  const [notes, setNotes] = useState([]);

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/home" element={<Home notes={notes} />} />
        <Route path="/log" element={<Log onNotesUpdate={setNotes} />} />
        <Route path="/express" element={<Scene />} />
      </Routes>
    </div>
  );
};

const MainApp = () => (
  <Router>
    <App />
  </Router>
);

export default MainApp;
