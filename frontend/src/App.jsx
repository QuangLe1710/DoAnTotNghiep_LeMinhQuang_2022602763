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
            <Route path="/product/:id" element={<ProductDetail />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- KHU VỰC ADMIN --- */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProduct />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;