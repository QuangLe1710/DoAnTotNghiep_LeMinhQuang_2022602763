import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Lấy mã phản hồi từ VNPay (nếu có)
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const isVnPaySuccess = vnpResponseCode === '00';
    const isVnPayError = vnpResponseCode && vnpResponseCode !== '00';

    return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', minHeight: '80vh', alignItems: 'center' }}>
            {/* TRƯỜNG HỢP 1: THANH TOÁN VNPAY THẤT BẠI */}
            {isVnPayError ? (
                <Result
                    status="error"
                    icon={<CloseCircleFilled style={{ color: 'red' }} />}
                    title="Thanh toán thất bại!"
                    subTitle="Giao dịch qua VNPay không thành công hoặc đã bị hủy."
                    extra={[
                        <Button type="primary" key="console" onClick={() => navigate('/checkout')}>
                            Thử lại
                        </Button>,
                        <Button key="buy" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>,
                    ]}
                />
            ) : (
                /* TRƯỜNG HỢP 2: THÀNH CÔNG (COD HOẶC VNPAY OK) */
                <Result
                    status="success"
                    icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
                    title="Đặt hàng thành công!"
                    subTitle={isVnPaySuccess ? "Bạn đã thanh toán thành công qua VNPay. Đơn hàng đang được xử lý." : "Cảm ơn bạn đã mua sắm. Đơn hàng sẽ sớm được giao."}
                    extra={[
                        <Button type="primary" key="console" onClick={() => navigate('/')}>
                            Tiếp tục mua sắm
                        </Button>,
                        <Button key="buy" onClick={() => navigate('/history')}>
                            Xem lịch sử đơn hàng
                        </Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default PaymentSuccess;