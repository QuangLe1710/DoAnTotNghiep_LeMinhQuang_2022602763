import React from 'react';
import { Table, Button, InputNumber, Typography, Card, Row, Col, Empty, Tag, Image } from 'antd'; // Import thêm Tag, Image
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { 
    CustomerServiceOutlined, 
    PhoneOutlined, 
    FacebookOutlined, 
    MessageOutlined, 
    VerticalAlignTopOutlined 
} from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FloatButton } from 'antd';

const { Title, Text } = Typography;

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* 1. Sửa lỗi ảnh: Dùng record.thumbnail */}
                    <div style={{ marginRight: 10, flexShrink: 0 }}>
                        {record.thumbnail ? (
                            <Image 
                                src={record.thumbnail} 
                                alt={record.name} 
                                width={60} 
                                height={60} 
                                style={{ objectFit: 'cover', borderRadius: 4 }} 
                            />
                        ) : (
                            <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4 }} />
                        )}
                    </div>
                    
                    <div>
                        <div style={{ fontWeight: 'bold', lineHeight: '1.2', marginBottom: 4 }}>
                            {record.name}
                        </div>
                        {/* 2. Sửa lỗi Object Brand: Dùng record.brand.name */}
                        {record.brand && (
                            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                                {typeof record.brand === 'object' ? record.brand.name : record.brand}
                            </Tag>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => <span style={{ color: '#888' }}>{price?.toLocaleString()} đ</span>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            render: (_, record) => (
                <InputNumber 
                    min={1} 
                    max={record.stockQuantity || 10} // Giới hạn max theo tồn kho nếu có
                    value={record.quantity} 
                    onChange={(value) => updateQuantity(record.id, value)} 
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 150,
            render: (_, record) => (
                <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                    {(record.price * record.quantity).toLocaleString()} đ
                </span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} />
            ),
        },
    ];

    if (cartItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: 80 }}>
                <Empty description="Giỏ hàng trống trơn" />
                <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>
                    Tiếp tục mua sắm
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            <Title level={2} style={{ marginBottom: 30 }}><ShoppingCartOutlined /> Giỏ hàng của bạn</Title>
            
            <Row gutter={24}>
                {/* Bảng danh sách sản phẩm */}
                <Col xs={24} lg={16}>
                    <Table 
                        columns={columns} 
                        dataSource={cartItems} 
                        rowKey="id" 
                        pagination={false} 
                        bordered={false}
                        style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}
                    />
                </Col>

                {/* Cột tổng tiền */}
                <Col xs={24} lg={8}>
                    <Card title="Tổng đơn hàng" style={{ position: 'sticky', top: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <Text>Tạm tính:</Text>
                            <Text strong>{(totalAmount || 0).toLocaleString()} đ</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <Text>Phí vận chuyển:</Text>
                            <Text type="success">Miễn phí</Text>
                        </div>
                        <div style={{ height: 1, background: '#f0f0f0', margin: '15px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
                            <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                            <Title level={4} type="danger" style={{ margin: 0 }}>{(totalAmount || 0).toLocaleString()} đ</Title>
                        </div>
                        
                        <Button 
                            type="primary" 
                            size="large" 
                            block 
                            icon={<ArrowRightOutlined />}
                            onClick={() => navigate('/checkout')}
                            style={{ height: 50, fontSize: 16, fontWeight: 600 }}
                        >
                            TIẾN HÀNH ĐẶT HÀNG
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* --- NÚT LIÊN HỆ NỔI (FLOATING ACTION BUTTON) --- */}
            <FloatButton.Group
                trigger="click" // Bấm vào để xòe ra (Toggle)
                type="primary" // Màu xanh chủ đạo
                style={{ right: 24, bottom: 24 }} // Vị trí góc phải dưới
                icon={<CustomerServiceOutlined />} // Icon mặc định (Tai nghe CSKH)
                tooltip={<div>Cần hỗ trợ?</div>}
            >
                {/* 1. Nút gọi điện */}
                <FloatButton 
                    icon={<PhoneOutlined />} 
                    tooltip={<div>Hotline: 0348.773.921</div>}
                    onClick={() => window.open('tel:0348773921')} // Gọi điện ngay
                />

                {/* 2. Nút Zalo (Dùng tạm icon Message vì AntD ko có icon Zalo) */}
                <FloatButton 
                    icon={<MessageOutlined />} 
                    tooltip={<div>Chat Zalo</div>}
                    onClick={() => window.open('https://zalo.me/0348773921', '_blank')} 
                />

                {/* 3. Nút Facebook */}
                <FloatButton 
                    icon={<FacebookOutlined />} 
                    tooltip={<div>Fanpage Facebook</div>}
                    onClick={() => window.open('https://www.facebook.com/lomo.quang.9/', '_blank')} 
                />
                
                {/* 4. Nút cuộn lên đầu trang (Tiện ích thêm) */}
                <FloatButton.BackTop visibilityHeight={0} icon={<VerticalAlignTopOutlined />} />
            </FloatButton.Group>
        </div>
    );
};

export default Cart;