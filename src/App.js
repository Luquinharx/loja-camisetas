import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import Auth from './pages/auth.jsx';
import Catalogo from './pages/catalogo.js';
import Produto from './pages/produto.js';
import Cart from './pages/cart.jsx';
import Checkout from './pages/checkout.jsx';
import UserOrders from './pages/UserOrders.js';
import PaymentInstructions from './pages/paymentinstructions.jsx';
import Profile from './pages/profile.jsx';
import './styles/auth.css';
import './styles/home.css';
import './styles/catalogo.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/produto/:id" element={<Produto />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<UserOrders />} />
        <Route path="/payment-instructions/:orderId" element={<PaymentInstructions />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
