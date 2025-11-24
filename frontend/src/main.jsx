import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext'; // <--- Import mới

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <CompareProvider> {/* <--- Bọc thêm cái này */}
        <App />
      </CompareProvider>
    </CartProvider>
  </React.StrictMode>,
)