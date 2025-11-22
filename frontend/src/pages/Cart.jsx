import React from 'react';
import { Table, Button, InputNumber, Typography, Card, Row, Col, Empty, Space, Divider } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={record.image} alt={record.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 10 }} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{record.brand}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price?.toLocaleString()} đ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_, record) => (
                <InputNumber 
                    min={1} 
                    max={10} 
                    value={record.quantity} 
                    onChange={(value) => updateQuantity(record.id, value)} 
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_, record) => (
                <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                    {(record.price * record.quantity).toLocaleString()} đ
                </span>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} />
            ),
        },
    ];

    if (cartItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <Empty description="Giỏ hàng trống trơn" />
                <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
                    Tiếp tục mua sắm
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            <Title level={2}><ShoppingCartOutlined /> Giỏ hàng của bạn</Title>
            
            <Row gutter={24}>
                {/* Bảng danh sách sản phẩm */}
                <Col xs={24} md={16}>
                    <Table 
                        columns={columns} 
                        dataSource={cartItems} 
                        rowKey="id" 
                        pagination={false} 
                        bordered 
                    />
                </Col>

                {/* Cột tổng tiền */}
                <Col xs={24} md={8}>
                    <Card title="Tổng đơn hàng" style={{ position: 'sticky', top: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text>Tạm tính:</Text>
                            <Text strong>{totalAmount.toLocaleString()} đ</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text>Phí vận chuyển:</Text>
                            <Text type="success">Miễn phí</Text>
                        </div>
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Title level={4}>Tổng cộng:</Title>
                            <Title level={4} type="danger">{totalAmount.toLocaleString()} đ</Title>
                        </div>
                        
                        <Button 
                            type="primary" 
                            size="large" 
                            block 
                            icon={<ArrowRightOutlined />}
                            onClick={() => navigate('/checkout')} // Chuyển sang trang thanh toán (làm sau)
                        >
                            TIẾN HÀNH ĐẶT HÀNG
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Cart;