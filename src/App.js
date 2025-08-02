// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import HomeScreen from './pages/HomeScreen';
import MealBoxScreen from './pages/MealBoxScreen';
//import LiveCountersScreen from './pages/LiveCountersScreen';
import AdminMenu from './pages/ADMIN_MENU';
import BulkOrders from './pages/bulk-orders';
import PlatterDetail from './pages/PlatterDetail';
import CartPage from './pages/CartPage';
import CateringServices from './pages/CateringServices';
import CheckoutPage from './pages/CheckoutPage';
import './index.css';
import "./components/GlobalHeader&Footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/meal-boxes" element={<MealBoxScreen />} />
        <Route path="/admin-menu" element={<AdminMenu />} />
        <Route path="/bulk-orders" element={<BulkOrders />} />
        <Route path="/bulk-orders/:id" element={<PlatterDetail />} />
        <Route path="/cart-page" element={<CartPage />} />
        <Route path="/catering-services" element={<CateringServices />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* Uncomment when LiveCountersScreen is ready */}
        {/* <Route path="/live-counters" element={<LiveCountersScreen />} /> */}
      </Routes>
    </Router>
  );
}

export default App;