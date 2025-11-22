import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // 1. Khi mở web lên -> Lấy giỏ hàng từ LocalStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // 2. Mỗi khi giỏ hàng thay đổi -> Lưu lại vào LocalStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- CÁC HÀM XỬ LÝ LOGIC ---

    // Thêm sản phẩm vào giỏ
    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        if (existingItem) {
            // Nếu đã có -> Tăng số lượng
            setCartItems(cartItems.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            // Nếu chưa có -> Thêm mới với quantity = 1
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
        message.success("Đã thêm vào giỏ hàng!");
    };

    // Xóa sản phẩm khỏi giỏ
    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.id !== productId));
        message.success("Đã xóa sản phẩm!");
    };

    // Cập nhật số lượng (Tăng/Giảm)
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return; // Không cho giảm dưới 1
        setCartItems(cartItems.map(item => 
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    // Xóa sạch giỏ hàng (Sau khi thanh toán xong)
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    // Tính tổng tiền tạm tính
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};