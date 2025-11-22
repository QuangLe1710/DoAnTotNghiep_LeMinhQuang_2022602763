import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'; // <--- Import file vừa tạo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bọc App bên trong CartProvider */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)