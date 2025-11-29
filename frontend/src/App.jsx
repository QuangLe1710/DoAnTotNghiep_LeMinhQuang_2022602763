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
import PaymentSuccess from './pages/PaymentSuccess';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    // Lấy roles từ localStorage (dạng chuỗi JSON)
    const rolesString = localStorage.getItem('roles');
    let roles = [];
    
    try {
        roles = rolesString ? JSON.parse(rolesString) : [];
    } catch (e) {
        roles = [];
    }

    // 1. Nếu chưa đăng nhập (không có token) -> Về Login
    if (!token) return <Navigate to="/login" />;

    // 2. Nếu đã đăng nhập nhưng không có quyền ADMIN -> Về Trang chủ
    if (!roles.includes("ROLE_ADMIN")) {
        alert("Bạn không có quyền truy cập trang Admin!");
        return <Navigate to="/" />;
    }

    // 3. Đủ điều kiện -> Cho vào
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ... (Các route khách hàng giữ nguyên) ... */}
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} /> 
            <Route path="checkout" element={<Checkout />} />
            <Route path="history" element={<OrderHistory />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment-success" element={<PaymentSuccess />} /> {/* Sửa lại path có dấu / */}

        {/* --- KHU VỰC ADMIN --- */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            {/* Nếu vào /admin mà không gõ gì thêm -> tự chuyển vào dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} /> 
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