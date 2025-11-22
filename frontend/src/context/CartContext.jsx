import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // --- SỬA ĐOẠN NÀY ---
    // Thay vì useState([]), ta dùng hàm để lấy dữ liệu ngay lập tức khi khởi tạo
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    // --- BỎ useEffect SỐ 1 (Đọc dữ liệu) VÌ ĐÃ LÀM Ở TRÊN RỒI ---
    
    // Giữ nguyên useEffect SỐ 2 (Lưu dữ liệu khi thay đổi)
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- CÁC HÀM DƯỚI GIỮ NGUYÊN KHÔNG ĐỔI ---
    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        if (existingItem) {
            setCartItems(cartItems.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
        message.success("Đã thêm vào giỏ hàng!");
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.id !== productId));
        message.success("Đã xóa sản phẩm!");
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return; 
        setCartItems(cartItems.map(item => 
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};