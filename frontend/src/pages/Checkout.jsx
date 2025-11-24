import React from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message } from 'antd';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

const Checkout = () => {
    const { cartItems, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Lấy thông tin user đăng nhập (nếu có) để điền sẵn
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const onFinish = async (values) => {
        const orderData = {
            customerName: values.fullName,
            address: values.address,
            phone: values.phone,
            totalAmount: totalAmount,
            status: "PENDING", // Trạng thái chờ duyệt
            orderDetails: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            username: user?.username || "GUEST",
        };

        try {
            // Gọi API tạo đơn hàng (Sẽ làm ở Bước 3)
            await api.post('/orders/place', orderData); 
            message.success("Đặt hàng thành công!");
            clearCart(); // Xóa giỏ hàng
            navigate('/'); // Quay về trang chủ (hoặc trang Lịch sử đơn hàng nếu làm)
        } catch (error) {
            message.error("Đặt hàng thất bại, vui lòng thử lại!");
        }
    };

    return (
        <div style={{ padding: '20px 0', maxWidth: 800, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center' }}>Thanh toán đơn hàng</Title>
            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Thông tin giao hàng">
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={onFinish}
                            initialValues={{ fullName: user?.fullName || '' }}
                        >
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                                <Input placeholder="Nhập họ tên người nhận" />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                            <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true }]}>
                                <Input.TextArea rows={3} placeholder="Số nhà, đường, phường/xã..." />
                            </Form.Item>
                            
                            <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 20 }}>
                                XÁC NHẬN ĐẶT HÀNG ({totalAmount.toLocaleString()} đ)
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Tóm tắt đơn hàng" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                marginBottom: 15, 
                                borderBottom: '1px solid #f0f0f0', 
                                paddingBottom: 15 
                            }}>
                                {/* Bên trái: Ảnh + Tên + Số lượng */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        style={{ 
                                            width: 60, 
                                            height: 60, 
                                            objectFit: 'cover', 
                                            borderRadius: 6, 
                                            border: '1px solid #eee',
                                            marginRight: 15 
                                        }} 
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ fontSize: 13, color: '#888' }}>
                                            Đơn giá: {item.price?.toLocaleString()} đ <span style={{ margin: '0 5px' }}>x</span> {item.quantity}
                                        </div>
                                    </div>
                                </div>

                                {/* Bên phải: Thành tiền */}
                                <div style={{ fontWeight: 'bold', color: '#333' }}>
                                    {(item.price * item.quantity).toLocaleString()} đ
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 20, paddingTop: 15, borderTop: '2px dashed #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 16, color: '#666' }}>Tổng thanh toán:</span>
                            <span style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
                                {totalAmount.toLocaleString()} đ
                            </span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout;