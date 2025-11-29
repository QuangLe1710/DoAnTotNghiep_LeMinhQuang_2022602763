import React, { useEffect, useState, useRef } from 'react';
import { Card, Col, Row, Typography, Spin, Button, Rate, message, Tag, Carousel, Checkbox, Slider, Divider, Empty } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, LeftOutlined, RightOutlined, FilterOutlined, DiffOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext'; // Import context so sánh
import { FloatButton } from 'antd';
import { CustomerServiceOutlined, PhoneOutlined, FacebookOutlined, MessageOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title, Paragraph } = Typography;

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Dữ liệu bộ lọc động từ API
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const { addToCart } = useCart();
    const { addToCompare } = useCompare(); // Lấy hàm so sánh
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const carouselRef = useRef(null);

    const searchTerm = searchParams.get('search');

    // --- STATE BỘ LỌC ---
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]); // Mới
    const [priceRange, setPriceRange] = useState([0, 50000000]);

    // 1. Tải dữ liệu (Sản phẩm + Brand + Category)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, brandRes, cateRes] = await Promise.all([
                    api.get('/products?page=0&limit=100'), // Lấy nhiều chút
                    api.get('/brands'),
                    api.get('/categories')
                ]);

                // Xử lý dữ liệu sản phẩm (API phân trang trả về object)
                const productList = prodRes.data.products || [];
                setProducts(productList);
                setFilteredProducts(productList);

                // Set dữ liệu bộ lọc
                setBrands(brandRes.data);
                setCategories(cateRes.data);

            } catch (error) {
                message.error("Lỗi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. LOGIC LỌC TỔNG HỢP
    useEffect(() => {
        let temp = [...products];

        // Lọc theo từ khóa
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            temp = temp.filter(p => 
                p.name.toLowerCase().includes(lowerTerm) || 
                (p.brandName && p.brandName.toLowerCase().includes(lowerTerm)) ||
                (p.categoryName && p.categoryName.toLowerCase().includes(lowerTerm))
            );
        }

        // Lọc theo Hãng (So sánh tên hãng)
        if (selectedBrands.length > 0) {
            temp = temp.filter(p => selectedBrands.includes(p.brandName));
        }

        // Lọc theo Danh mục (Mới)
        if (selectedCategories.length > 0) {
            temp = temp.filter(p => selectedCategories.includes(p.categoryName));
        }

        // Lọc theo Giá
        temp = temp.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        setFilteredProducts(temp);

    }, [selectedBrands, selectedCategories, priceRange, products, searchTerm]);

    // Banner data (Giữ nguyên)
    const banners = [
        { id: 1, title: "SIÊU SALE MÙA TỰU TRƯỜNG", desc: "Giảm giá 30% - Tặng Balo & Chuột", color: 'linear-gradient(90deg, #1890ff 0%, #0050b3 100%)' },
        { id: 2, title: "MACBOOK AIR M2 - ĐỈNH CAO", desc: "Sở hữu siêu phẩm Apple chỉ từ 26 triệu", color: 'linear-gradient(90deg, #ff4d4f 0%, #cf1322 100%)' },
        { id: 3, title: "GAMING LAPTOP - CHIẾN GAME", desc: "Cấu hình khủng - Màn hình 144Hz", color: 'linear-gradient(90deg, #52c41a 0%, #237804 100%)' }
    ];
    
    const contentStyle = { height: '300px', color: '#fff', lineHeight: '160px', textAlign: 'center', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px' };
    const arrowStyle = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background 0.3s' };

    return (
        <div>
            {/* Banner Slider */}
            {!searchTerm && (
                <div style={{ position: 'relative', marginBottom: 40, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Button shape="circle" icon={<LeftOutlined />} style={{ ...arrowStyle, left: '10px' }} onClick={() => carouselRef.current.prev()} />
                    <Button shape="circle" icon={<RightOutlined />} style={{ ...arrowStyle, right: '10px' }} onClick={() => carouselRef.current.next()} />
                    <Carousel ref={carouselRef} autoplay autoplaySpeed={5000} effect="fade">
                        {banners.map(item => (
                            <div key={item.id}>
                                <div style={{ ...contentStyle, background: item.color }}>
                                    <Title level={1} style={{ color: 'white', margin: 0, fontSize: '36px', textTransform: 'uppercase' }}>{item.title}</Title>
                                    <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginTop: 10 }}>{item.desc}</Paragraph>
                                    <Button type="primary" size="large" ghost style={{ marginTop: 20, padding: '0 40px' }}>MUA NGAY</Button>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            )}

            <Row gutter={24}>
                {/* --- SIDEBAR BỘ LỌC --- */}
                <Col xs={24} sm={24} md={6} lg={5}>
                    <Card title={<><FilterOutlined /> Bộ lọc tìm kiếm</>} style={{ position: 'sticky', top: 20 }} size="small">
                        
                        {/* 1. Lọc Danh mục (Mới) */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 10 }}>Danh mục</h4>
                            <Checkbox.Group 
                                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                onChange={setSelectedCategories}
                            >
                                {categories.map(c => (
                                    <Checkbox key={c.id} value={c.name}>{c.name}</Checkbox>
                                ))}
                            </Checkbox.Group>
                        </div>
                        <Divider />

                        {/* 2. Lọc Hãng (Động từ API) */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 10 }}>Thương hiệu</h4>
                            <Checkbox.Group 
                                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                onChange={setSelectedBrands}
                            >
                                {brands.map(b => (
                                    <Checkbox key={b.id} value={b.name}>{b.name}</Checkbox>
                                ))}
                            </Checkbox.Group>
                        </div>
                        <Divider />

                        {/* 3. Lọc Giá */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 10 }}>Khoảng giá</h4>
                            <Slider 
                                range 
                                min={0} 
                                max={50000000} 
                                step={1000000}
                                defaultValue={[0, 50000000]} 
                                onChange={setPriceRange}
                                tooltip={{ formatter: value => `${(value/1000000)} tr` }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                                <span>{priceRange[0].toLocaleString()} đ</span>
                                <span>{priceRange[1].toLocaleString()} đ</span>
                            </div>
                        </div>

                        <Button type="primary" block onClick={() => { 
                            setSelectedBrands([]); 
                            setSelectedCategories([]);
                            setPriceRange([0, 50000000]); 
                            navigate('/'); 
                        }}>
                            Xóa bộ lọc
                        </Button>
                    </Card>
                </Col>

                {/* --- DANH SÁCH SẢN PHẨM --- */}
                <Col xs={24} sm={24} md={18} lg={19}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                        <Title level={3} style={{ margin: 0, borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>
                            {searchTerm ? `Kết quả: "${searchTerm}"` : 'Tất cả sản phẩm'} 
                            <span style={{ fontSize: '16px', color: '#888', marginLeft: 10, fontWeight: 'normal' }}>
                                ({filteredProducts.length} sản phẩm)
                            </span>
                        </Title>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
                    ) : (
                        filteredProducts.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {filteredProducts.map((product) => (
                                    <Col xs={24} sm={12} md={12} lg={8} xl={8} key={product.id}>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0', height: '100%' }}
                                            bodyStyle={{ padding: 12 }}
                                            cover={
                                                <div style={{ position: 'relative', height: 180, padding: 10, textAlign: 'center', backgroundColor: '#fff' }}>
                                                    <img 
                                                        alt={product.name} 
                                                        // Logic lấy ảnh: Thumbnail -> Ảnh đầu -> Placeholder
                                                        src={product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image')}
                                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} 
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }}
                                                    />
                                                    <Tag color="#f50" style={{ position: 'absolute', top: 10, right: 10, borderRadius: 4 }}>HOT</Tag>
                                                </div>
                                            }
                                            actions={[
                                                <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/product/${product.id}`)}>
                                                    Chi tiết
                                                </Button>,
                                                <Button 
                                                    type="text" 
                                                    icon={<DiffOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCompare(product); // Nút so sánh
                                                    }}
                                                >
                                                    So sánh
                                                </Button>,
                                                <Button 
                                                    type="primary" 
                                                    icon={<ShoppingCartOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                >
                                                    Thêm
                                                </Button>
                                            ]}
                                        >
                                            <Meta
                                                title={
                                                    <div 
                                                        style={{ color: '#333', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        title={product.name}
                                                    >
                                                        {product.name}
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <div style={{ color: '#cf1322', fontWeight: 'bold', fontSize: 16, margin: '5px 0' }}>
                                                            {product.price?.toLocaleString()} đ
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#888', marginBottom: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                            <Tag style={{marginRight:0}}>{product.brandName}</Tag>
                                                            <Tag style={{marginRight:0}}>{product.categoryName}</Tag>
                                                        </div>
                                                        <Rate disabled defaultValue={5} style={{ fontSize: 10 }} />
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="Không tìm thấy sản phẩm nào phù hợp" style={{ marginTop: 50 }} />
                        )
                    )}
                </Col>
            </Row>

            {/* Float Buttons */}
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{ right: 24, bottom: 24 }}
                icon={<CustomerServiceOutlined />}
            >
                <FloatButton icon={<PhoneOutlined />} onClick={() => window.open('tel:0348773921')} />
                <FloatButton icon={<MessageOutlined />} onClick={() => window.open('https://zalo.me/0348773921', '_blank')} />
                <FloatButton icon={<FacebookOutlined />} onClick={() => window.open('https://facebook.com', '_blank')} />
                <FloatButton.BackTop visibilityHeight={0} icon={<VerticalAlignTopOutlined />} />
            </FloatButton.Group>
        </div>
    );
};

export default Home;