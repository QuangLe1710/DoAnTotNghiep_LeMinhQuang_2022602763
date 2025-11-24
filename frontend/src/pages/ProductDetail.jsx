import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Spin, message, Descriptions, Image, Tag } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons'; // Import thêm RocketOutlined cho đẹp
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext'; // Import context
import { DiffOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { addToCompare } = useCompare(); // Lấy hàm add

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                message.error("Không tìm thấy sản phẩm!");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    // --- [HÀM MỚI] XỬ LÝ MUA NGAY ---
    const handleBuyNow = () => {
        if (product) {
            // 1. Thêm vào giỏ hàng
            addToCart(product); 
            // 2. Chuyển hướng thẳng đến trang thanh toán
            navigate('/checkout'); 
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    if (!product) return null;

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
                Quay lại
            </Button>

            <Card bordered={false} style={{ borderRadius: 8 }}>
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={10}>
                        <div style={{ border: '1px solid #f0f0f0', padding: 20, borderRadius: 8, textAlign: 'center' }}>
                            <Image src={product.image} alt={product.name} />
                        </div>
                    </Col>

                    <Col xs={24} md={14}>
                        <Tag color="blue">{product.brand}</Tag>
                        <Title level={2} style={{ marginTop: 5 }}>{product.name}</Title>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <Rate disabled defaultValue={5} /> 
                            <span style={{ marginLeft: 10, color: '#888' }}>(10 đánh giá)</span>
                        </div>

                        <Title level={3} style={{ color: '#cf1322', margin: '0 0 20px 0' }}>
                            {product.price?.toLocaleString()} đ
                        </Title>

                        <Paragraph style={{ fontSize: 16 }}>
                            {product.description || "Sản phẩm chính hãng, bảo hành 12 tháng."}
                        </Paragraph>

                        <Descriptions title="Thông số kỹ thuật" bordered size="small" column={1} style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="CPU">{product.cpu}</Descriptions.Item>
                            <Descriptions.Item label="RAM">{product.ram}</Descriptions.Item>
                            <Descriptions.Item label="Ổ cứng">{product.storage}</Descriptions.Item>
                            <Descriptions.Item label="Màn hình">{product.screen}</Descriptions.Item>
                        </Descriptions>

                        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<ShoppingCartOutlined />} 
                                style={{ height: 50, width: 200 }}
                                onClick={() => addToCart(product)}
                            >
                                THÊM VÀO GIỎ
                            </Button>

                            {/* --- [CẬP NHẬT] NÚT MUA NGAY --- */}
                            <Button 
                                size="large" 
                                type="primary" 
                                danger 
                                icon={<RocketOutlined />} // Thêm icon tên lửa cho sinh động
                                style={{ height: 50, width: 200, background: 'linear-gradient(90deg, #ff4d4f 0%, #cf1322 100%)', border: 'none' }}
                                onClick={handleBuyNow} // Gọi hàm xử lý
                            >
                                MUA NGAY
                            </Button>

                            {/* --- [NÚT MỚI] THÊM VÀO SO SÁNH --- */}
                            <Button 
                                size="large" 
                                icon={<DiffOutlined />} 
                                style={{ height: 50 }}
                                onClick={() => addToCompare(product)}
                                title="So sánh sản phẩm này"
                            />
                        </div>

                        <div style={{ marginTop: 20, color: '#52c41a' }}>
                            <CheckCircleOutlined /> Còn hàng - Giao hàng tận nơi miễn phí
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ProductDetail;