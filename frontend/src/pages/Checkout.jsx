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
                    <Card title="Tóm tắt đơn hàng">
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                                <div>
                                    <strong>{item.name}</strong> <br/>
                                    <small>x{item.quantity}</small>
                                </div>
                                <div>{(item.price * item.quantity).toLocaleString()} đ</div>
                            </div>
                        ))}
                        <div style={{ marginTop: 20, textAlign: 'right', fontSize: 18, fontWeight: 'bold', color: '#cf1322' }}>
                            Tổng: {totalAmount.toLocaleString()} đ
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout;