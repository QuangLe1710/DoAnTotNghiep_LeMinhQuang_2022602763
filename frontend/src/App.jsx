import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/AdminLayout';
import AdminProduct from './pages/AdminProduct';
import Dashboard from './pages/Dashboard';
import ClientLayout from './components/ClientLayout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import AdminOrder from './pages/AdminOrder';
import OrderHistory from './pages/OrderHistory';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (!token || !user) return <Navigate to="/login" />;
    if (user.role !== 'ADMIN') {
        alert("Bạn không có quyền truy cập trang Admin!");
        return <Navigate to="/" />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- KHU VỰC KHÁCH HÀNG --- */}
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} /> {/* <--- 2. THÊM DÒNG NÀY */}
            <Route path="checkout" element={<Checkout />} />
            <Route path="history" element={<OrderHistory />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- KHU VỰC ADMIN --- */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProduct />} />
            <Route path="orders" element={<AdminOrder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;