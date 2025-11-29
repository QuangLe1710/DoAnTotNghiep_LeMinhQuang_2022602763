import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    
    // Check login
    const isLogin = !!localStorage.getItem('token');

    // --- 1. LOAD GIỎ HÀNG (CÓ LOGIC GỘP) ---
    const fetchCart = async () => {
        let itemsRaw = [];

        if (isLogin) {
            try {
                // Lấy từ Backend
                const response = await api.get('/carts');
                const items = response.data.cartItems || [];
                // Map dữ liệu phẳng
                itemsRaw = items.map(item => ({
                    ...item.product,
                    quantity: item.quantity,
                    thumbnail: item.product.images && item.product.images.length > 0 
                        ? item.product.images.find(img => img.isThumbnail)?.imageUrl || item.product.images[0].imageUrl 
                        : null
                }));
            } catch (error) {
                console.error("Lỗi tải giỏ hàng", error);
            }
        } else {
            // Lấy từ LocalStorage
            itemsRaw = JSON.parse(localStorage.getItem('cart') || '[]');
        }

        // --- LOGIC GỘP TRÙNG LẶP (QUAN TRỌNG) ---
        // Gom các item có cùng ID lại thành 1 dòng và cộng dồn số lượng
        const mergedItems = Object.values(
            itemsRaw.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = { ...item };
                } else {
                    acc[item.id].quantity += item.quantity;
                }
                return acc;
            }, {})
        );

        setCartItems(mergedItems);
    };

    useEffect(() => { fetchCart(); }, [isLogin]);

    // --- 2. MERGE LOGIN ---
    useEffect(() => {
        const handleAuthChange = async () => {
            if (localStorage.getItem('token')) {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (localCart.length > 0) {
                    try {
                        const itemsToSend = localCart.map(item => ({ productId: item.id, quantity: item.quantity }));
                        await api.post('/carts/merge', itemsToSend);
                        localStorage.removeItem('cart');
                        message.success("Đã đồng bộ giỏ hàng!");
                    } catch (error) {}
                }
            }
            fetchCart();
        };
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    // --- 3. CÁC HÀM CRUD ---
    const addToCart = async (product, quantity = 1) => {
        if (isLogin) {
            try {
                await api.post(`/carts/add?productId=${product.id}&quantity=${quantity}`);
                message.success("Đã thêm vào giỏ!");
                fetchCart();
            } catch (e) { message.error("Lỗi thêm giỏ hàng!"); }
        } else {
            let temp = [...JSON.parse(localStorage.getItem('cart') || '[]')];
            const idx = temp.findIndex(p => p.id === product.id);
            if (idx > -1) temp[idx].quantity += quantity;
            else temp.push({ ...product, quantity });
            localStorage.setItem('cart', JSON.stringify(temp));
            setCartItems(temp); // Cập nhật state ngay
            fetchCart(); // Gọi lại fetch để chạy qua logic gộp
            message.success("Đã thêm vào giỏ!");
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        if (isLogin) {
            await api.put(`/carts/update?productId=${productId}&quantity=${newQuantity}`);
            fetchCart();
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const newCart = localCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
            localStorage.setItem('cart', JSON.stringify(newCart));
            fetchCart(); // Gọi lại fetch để gộp và set state
        }
    };

    const removeFromCart = async (productId) => {
        if (isLogin) {
            await api.delete(`/carts/remove/${productId}`);
            fetchCart();
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const newCart = localCart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(newCart));
            fetchCart();
        }
    };

    const clearCart = async () => {
        if (isLogin) {
            await api.delete('/carts/clear');
            fetchCart();
        } else {
            setCartItems([]);
            localStorage.removeItem('cart');
        }
    };

    // Tính tổng tiền an toàn (tránh lỗi undefined)
    const totalAmount = cartItems.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};