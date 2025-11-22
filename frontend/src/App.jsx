import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Trang Home tạm thời (Để test sau khi login thành công)
const Home = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h1>Chào mừng, {user ? user.username : 'Khách'}!</h1>
            {user && <p>Chức vụ: {user.role}</p>}
            <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                Đăng Xuất
            </button>
        </div>
    );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        {/* Nếu gõ linh tinh thì tự về login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;