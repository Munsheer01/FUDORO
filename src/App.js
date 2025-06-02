// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import HomeScreen from './pages/HomeScreen';
import MealBoxScreen from './pages/MealBoxScreen';
//import LiveCountersScreen from './pages/LiveCountersScreen';
import './index.css';
import "./components/GlobalHeader&Footer.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/meal-boxes" element={<MealBoxScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
