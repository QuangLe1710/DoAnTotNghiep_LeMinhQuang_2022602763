import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message, Radio, Space } from 'antd';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

const Checkout = () => {
    const { cartItems, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const onFinish = async (values) => {
        const orderData = {
            customerName: values.fullName,
            address: values.address,
            phone: values.phone,
            totalAmount: totalAmount,
            status: "PENDING",
            orderDetails: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            username: user?.username || "GUEST",
        };

        try {
            const response = await api.post('/orders/place', orderData);
            const newOrderId = response.data.id; // Đảm bảo Backend trả về ID

            if (paymentMethod === 'VNPAY') {
                const paymentRes = await api.get(`/payment/create_payment/${Math.round(totalAmount)}/${newOrderId}`); // Thêm Math.round cho chắc
                window.location.href = paymentRes.data;
            } else {
                message.success("Đặt hàng thành công!");
                clearCart();
                navigate('/');
            }
        } catch (error) {
            message.error("Đặt hàng thất bại, vui lòng thử lại!");
        }
    };

    return (
        <div style={{ padding: '20px 0', maxWidth: 900, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>Thanh toán đơn hàng</Title>
            
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ fullName: user?.fullName || '' }}
            >
                <Row gutter={24}>
                    {/* --- CỘT TRÁI: THÔNG TIN --- */}
                    <Col xs={24} md={12}>
                        <Card title="1. Thông tin giao hàng" style={{ marginBottom: 20 }}>
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                <Input placeholder="Nhập họ tên người nhận" size="large" />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                                <Input placeholder="Nhập số điện thoại" size="large" />
                            </Form.Item>
                            <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                                <Input.TextArea rows={3} placeholder="Số nhà, đường, phường/xã..." />
                            </Form.Item>
                        </Card>

                        <Card title="2. Phương thức thanh toán">
                            <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ width: '100%' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Radio value="COD" style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                                        Thanh toán khi nhận hàng (COD)
                                    </Radio>
                                    <Radio value="VNPAY" style={{ padding: '10px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: 8 }}>Thanh toán Online qua VNPay</span>
                                            <img src="https://sandbox.vnpayment.vn/paymentv2/images/icons/vnpay-logo.png" alt="VNPay" height={20} />
                                        </div>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </Card>
                    </Col>

                    {/* --- CỘT PHẢI: TÓM TẮT --- */}
                    <Col xs={24} md={12}>
                        <Card title="Tóm tắt đơn hàng" style={{ position: 'sticky', top: 20 }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid #f0f0f0' }}>
                                    <img 
                                        src={item.image || "https://placehold.co/60x60?text=No+Img"} // Ảnh dự phòng
                                        alt={item.name} 
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee', marginRight: 15 }} 
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
                                            <span>{item.price?.toLocaleString()} đ x {item.quantity}</span>
                                            <span style={{ fontWeight: 'bold', color: '#333' }}>{(item.price * item.quantity).toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: 20, paddingTop: 15, borderTop: '2px dashed #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 16 }}>Tổng thanh toán:</span>
                                <span style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>{totalAmount.toLocaleString()} đ</span>
                            </div>

                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large" 
                                style={{ marginTop: 20, height: 50, fontSize: 16, fontWeight: 'bold', backgroundColor: paymentMethod === 'VNPAY' ? '#005baa' : '#1890ff' }}
                            >
                                {paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'ĐẶT HÀNG NGAY'}
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default Checkout;