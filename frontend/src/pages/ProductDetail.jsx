import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Rate, Tag, Divider, Spin, message, Image, Card, Breadcrumb } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, CheckCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(''); // State lưu ảnh đang hiển thị to
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                const data = response.data;
                setProduct(data);
                
                // Mặc định ảnh to là thumbnail hoặc ảnh đầu tiên
                setMainImage(data.thumbnail || (data.images && data.images[0]) || '');
            } catch (error) {
                message.error("Không tìm thấy sản phẩm!");
                navigate('/');
            } finally {
                setLoading(false);
            }

            // --- GỌI THÊM API LIÊN QUAN ---
            try {
                const relatedRes = await api.get(`/products/${id}/related`);
                setRelatedProducts(relatedRes.data);
            } catch (e) { console.error("Lỗi tải sản phẩm liên quan"); }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    if (!product) return null;

    // Tính toán giảm giá
    const discount = product.price > product.salePrice && product.salePrice > 0 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
        : 0;

    return (
        <div style={{ padding: '20px 50px', background: '#fff' }}>
            {/* Breadcrumb điều hướng */}
            <Breadcrumb style={{ marginBottom: 20 }}>
                <Breadcrumb.Item href="/"><HomeOutlined /></Breadcrumb.Item>
                <Breadcrumb.Item>{product.categoryName || 'Sản phẩm'}</Breadcrumb.Item>
                <Breadcrumb.Item>{product.brandName}</Breadcrumb.Item>
                <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
            </Breadcrumb>

            <Row gutter={[40, 40]}>
                {/* --- CỘT TRÁI: ẢNH SẢN PHẨM (GALLERY) --- */}
                <Col xs={24} md={10}>
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 20, marginBottom: 10, textAlign: 'center' }}>
                        <Image 
                            src={mainImage || 'https://via.placeholder.com/500'} 
                            alt={product.name}
                            style={{ maxHeight: 400, objectFit: 'contain' }}
                        />
                    </div>
                    {/* List ảnh nhỏ */}
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 5 }}>
                        {product.images?.map((img, index) => (
                            <div 
                                key={index}
                                style={{ 
                                    border: mainImage === img ? '2px solid #1890ff' : '1px solid #d9d9d9', 
                                    borderRadius: 4, 
                                    cursor: 'pointer',
                                    padding: 2,
                                    width: 70, height: 70, flexShrink: 0
                                }}
                                onClick={() => setMainImage(img)}
                                onMouseEnter={() => setMainImage(img)} // Hover cũng đổi ảnh
                            >
                                <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        ))}
                    </div>
                </Col>

                {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
                <Col xs={24} md={14}>
                    <Title level={2} style={{ marginBottom: 10 }}>{product.name}</Title>
                    
                    <div style={{ marginBottom: 20 }}>
                        <Rate disabled defaultValue={5} style={{ fontSize: 14 }} /> 
                        <Text type="secondary" style={{ marginLeft: 10 }}>(Xem 102 đánh giá)</Text>
                        <Divider type="vertical" />
                        <Text type="secondary">Đã bán: 1.2k</Text>
                    </div>

                    <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                            <Title level={2} type="danger" style={{ margin: 0 }}>
                                {(product.salePrice || product.price).toLocaleString()} đ
                            </Title>
                            {discount > 0 && (
                                <>
                                    <Text delete type="secondary" style={{ fontSize: 16 }}>{product.price.toLocaleString()} đ</Text>
                                    <Tag color="red">-{discount}%</Tag>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Nút Mua hàng */}
                    <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ShoppingCartOutlined />} 
                            style={{ height: 50, padding: '0 40px', fontSize: 18, fontWeight: 'bold' }}
                            onClick={() => addToCart(product)}
                        >
                            THÊM VÀO GIỎ
                        </Button>
                    </div>

                    <Divider />

                    {/* Thông số kỹ thuật */}
                    <Title level={4}>Cấu hình chi tiết</Title>
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                        {[
                            { label: 'CPU', value: product.cpu },
                            { label: 'RAM', value: product.ram },
                            { label: 'Ổ cứng', value: product.storage },
                            { label: 'Màn hình', value: product.screen },
                            { label: 'Card đồ họa', value: product.gpu },
                            { label: 'Pin', value: product.battery },
                            { label: 'Trọng lượng', value: product.weight ? `${product.weight} kg` : null },
                        ].map((item, idx) => (
                            item.value && (
                                <Col span={12} key={idx}>
                                    <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: 4 }}>
                                        <Text type="secondary">{item.label}: </Text>
                                        <Text strong>{item.value}</Text>
                                    </div>
                                </Col>
                            )
                        ))}
                    </Row>

                    {/* Mô tả & Chính sách */}
                    <Card size="small" title="Chính sách bảo hành" style={{ marginTop: 20 }}>
                        <p><CheckCircleOutlined style={{ color: '#52c41a' }} /> Bảo hành chính hãng <b>{product.warrantyPeriod || 12} tháng</b></p>
                        <p><SafetyOutlined style={{ color: '#1890ff' }} /> Đổi mới trong 30 ngày đầu nếu lỗi</p>
                    </Card>

                    <div style={{ marginTop: 30 }}>
                        <Title level={4}>Mô tả sản phẩm</Title>
                        <Paragraph>
                            {product.description ? 
                                product.description.split('\n').map((line, i) => <div key={i}>{line}<br/></div>) 
                                : 'Đang cập nhật...'}
                        </Paragraph>
                    </div>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0' }} />

            {/* --- KHỐI SẢN PHẨM LIÊN QUAN --- */}
            {relatedProducts.length > 0 && (
                <div>
                    <Title level={3} style={{ marginBottom: 20 }}>Có thể bạn cũng thích</Title>
                    <Row gutter={[16, 16]}>
                        {relatedProducts.map((p) => (
                            <Col xs={24} sm={12} md={6} key={p.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{ padding: 10, textAlign: 'center' }}>
                                            <img 
                                                alt={p.name} 
                                                src={p.thumbnail || (p.images && p.images[0])} 
                                                style={{ height: 150, objectFit: 'contain' }} 
                                            />
                                        </div>
                                    }
                                    onClick={() => {
                                        navigate(`/product/${p.id}`);
                                        window.scrollTo(0, 0); // Cuộn lên đầu khi chuyển trang
                                    }}
                                >
                                    <Card.Meta 
                                        title={p.name} 
                                        description={<span style={{ color: '#cf1322', fontWeight: 'bold' }}>{p.price?.toLocaleString()} đ</span>} 
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;