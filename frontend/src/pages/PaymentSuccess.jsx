import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    useEffect(() => {
        // Lấy các tham số VNPay trả về trên URL
        const params = Object.fromEntries([...searchParams]);
        
        // Nếu mã phản hồi là 00 (Thành công)
        if (searchParams.get('vnp_ResponseCode') === '00') {
            const confirmPayment = async () => {
                try {
                    // Gọi API Backend để cập nhật trạng thái đơn hàng thành SHIPPING
                    await api.get('/payment/vnpay_return', { params });
                    clearCart(); // Xóa giỏ hàng
                } catch (error) {
                    console.error("Lỗi xác thực thanh toán");
                }
            };
            confirmPayment();
        }
    }, []);

    const isSuccess = searchParams.get('vnp_ResponseCode') === '00';

    return (
        <div style={{ marginTop: 50, padding: 20 }}>
            <Result
                status={isSuccess ? "success" : "error"}
                title={isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
                subTitle={isSuccess 
                    ? "Cảm ơn bạn. Đơn hàng đã được thanh toán và đang chờ giao." 
                    : "Giao dịch bị hủy hoặc có lỗi xảy ra."}
                extra={[
                    <Button type="primary" key="home" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>,
                    <Button key="history" onClick={() => navigate('/history')}>
                        Xem lịch sử đơn
                    </Button>,
                ]}
            />
        </div>
    );
};

export default PaymentSuccess;