import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Customer Pages
import SplashScreen from './pages/SplashScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import HomeScreen from './pages/HomeScreen';
import MealBoxScreen from './pages/MealBoxScreen'; // ✅ MealBox browsing
import CustomizeMealBox from './pages/CustomizeMealBox'; // ✅ MealBox customization
import BulkOrders from './pages/bulk-orders';
import PlatterDetail from './pages/PlatterDetail';
import CartPage from './pages/CartPage';
import CateringServices from './pages/WeddingsCateringsHome'; // ✅ Wedding Catering Home
import CheckoutPage from './pages/CheckoutPage';
import CustomizeOrder from './pages/CustomizeOrder';
import OrderSummary from './pages/OrderSummary';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';

// Admin App
import AdminApp from './admin/AdminApp';

// Styles
import './index.css';
import "./components/GlobalHeader&Footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />

        {/* ✅ MealBox Flow Routes */}
        <Route path="/meal-boxes" element={<MealBoxScreen />} />
        <Route path="/customize-meal-box" element={<CustomizeMealBox />} />
        <Route path="/cart" element={<CartPage />} />

        {/* ✅ Bulk Orders Flow Routes */}
        <Route path="/bulk-orders" element={<BulkOrders />} />
        <Route path="/platter/:id" element={<PlatterDetail />} />
        <Route path="/customize" element={<CustomizeOrder />} />
        <Route path="/order-summary" element={<OrderSummary />} />

        {/* ✅ Wedding Catering Services Routes */}
        <Route path="/catering-services" element={<CateringServices />} />
        <Route path="/catering/customize" element={<CustomizeOrder />} />

        {/* Shared Order Management Routes */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
