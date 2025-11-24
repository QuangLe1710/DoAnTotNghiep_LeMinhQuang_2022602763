import React, { createContext, useState, useContext } from 'react';
import { message } from 'antd';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addToCompare = (product) => {
        // 1. Kiểm tra trùng
        if (compareList.find(item => item.id === product.id)) {
            message.warning("Sản phẩm này đã có trong danh sách so sánh!");
            return;
        }
        // 2. Giới hạn chỉ so sánh 2 sản phẩm (hoặc 3 tùy bạn, ở đây làm 2 cho dễ nhìn)
        if (compareList.length >= 2) {
            message.warning("Chỉ có thể so sánh tối đa 2 sản phẩm. Hãy xóa bớt!");
            setIsModalOpen(true); // Mở bảng lên để họ xóa
            return;
        }
        
        setCompareList([...compareList, product]);
        message.success("Đã thêm vào so sánh!");
    };

    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter(item => item.id !== productId));
    };

    const openCompareModal = () => setIsModalOpen(true);
    const closeCompareModal = () => setIsModalOpen(false);

    return (
        <CompareContext.Provider value={{ 
            compareList, 
            addToCompare, 
            removeFromCompare, 
            isModalOpen, 
            openCompareModal, 
            closeCompareModal 
        }}>
            {children}
        </CompareContext.Provider>
    );
};