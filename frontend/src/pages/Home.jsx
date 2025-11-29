import React, { useEffect, useState, useRef } from 'react';
import { Card, Col, Row, Typography, Spin, Button, Rate, message, Tag, Carousel, Checkbox, Slider, Divider, Empty } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, LeftOutlined, RightOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Import thêm useSearchParams
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { FloatButton } from 'antd';
import { 
    CustomerServiceOutlined, 
    PhoneOutlined, 
    FacebookOutlined, 
    MessageOutlined, 
    VerticalAlignTopOutlined 
} from '@ant-design/icons';

const { Meta } = Card;
const { Title, Paragraph } = Typography;

const Home = () => {
    const [products, setProducts] = useState([]); // Dữ liệu gốc từ API
    const [filteredProducts, setFilteredProducts] = useState([]); // Dữ liệu đã lọc để hiển thị
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Hook lấy tham số từ URL
    const carouselRef = useRef(null);

    // Lấy từ khóa "search" trên đường dẫn. Ví dụ: ?search=dell -> searchTerm = "dell"
    const searchTerm = searchParams.get('search');

    // --- STATE CHO BỘ LỌC BÊN TRÁI ---
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 50000000]);

    // 1. Tải danh sách sản phẩm khi vào trang
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Gọi API lấy tất cả (hoặc phân trang trang đầu tiên)
                const response = await api.get('/products?page=0&limit=100'); // Lấy nhiều chút để hiện trang chủ
                
                // Kiểm tra xem response.data có phải array không (trường hợp API cũ) hay là object (API mới)
                const productList = Array.isArray(response.data) ? response.data : response.data.products;
                
                setProducts(productList || []); // Fallback mảng rỗng nếu null
                setFilteredProducts(productList || []);
            } catch (error) {
                message.error("Lỗi tải sản phẩm!");
                setProducts([]); // Set mảng rỗng để tránh lỗi map
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 2. LOGIC LỌC TỔNG HỢP (Chạy lại mỗi khi có thay đổi Search, Brand, hoặc Price)
    useEffect(() => {
        let temp = [...products];

        // Bước 1: Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            temp = temp.filter(p => 
                p.name.toLowerCase().includes(lowerTerm) || 
                (p.brandName && p.brandName.toLowerCase().includes(lowerTerm)) || // Sửa p.brand thành p.brandName
                (p.description && p.description.toLowerCase().includes(lowerTerm))
            );
        }

        // Bước 2: Lọc theo Hãng
        if (selectedBrands.length > 0) {
            // Sửa p.brand thành p.brandName
            temp = temp.filter(p => selectedBrands.includes(p.brandName)); 
        }

        // Bước 3: Lọc theo Giá tiền
        temp = temp.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Cập nhật danh sách hiển thị
        setFilteredProducts(temp);

    }, [selectedBrands, priceRange, products, searchTerm]); // Thêm searchTerm vào dependency


    // Các tùy chọn hãng cho Sidebar
    const brandOptions = ['Dell', 'HP', 'Asus', 'Macbook', 'Acer', 'Lenovo'];

    // --- DỮ LIỆU BANNER ---
    const banners = [
        { id: 1, title: "SIÊU SALE MÙA TỰU TRƯỜNG", desc: "Giảm giá 30% - Tặng Balo & Chuột", color: 'linear-gradient(90deg, #1890ff 0%, #0050b3 100%)' },
        { id: 2, title: "MACBOOK AIR M2 - ĐỈNH CAO", desc: "Sở hữu siêu phẩm Apple chỉ từ 26 triệu", color: 'linear-gradient(90deg, #ff4d4f 0%, #cf1322 100%)' },
        { id: 3, title: "GAMING LAPTOP - CHIẾN GAME", desc: "Cấu hình khủng - Màn hình 144Hz", color: 'linear-gradient(90deg, #52c41a 0%, #237804 100%)' }
    ];
    
    const contentStyle = { height: '300px', color: '#fff', lineHeight: '160px', textAlign: 'center', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px' };
    const arrowStyle = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background 0.3s' };

    return (
        <div>
            {/* --- BANNER SLIDER (Chỉ hiện khi KHÔNG tìm kiếm để đỡ rối mắt) --- */}
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
                {/* --- CỘT TRÁI: BỘ LỌC (SIDER) --- */}
                <Col xs={24} sm={24} md={6} lg={5}>
                    <Card title={<><FilterOutlined /> Bộ lọc tìm kiếm</>} style={{ position: 'sticky', top: 20 }} size="small">
                        
                        {/* Lọc Hãng */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 10 }}>Thương hiệu</h4>
                            <Checkbox.Group 
                                options={brandOptions} 
                                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                                onChange={(checkedValues) => setSelectedBrands(checkedValues)}
                            />
                        </div>
                        
                        <Divider />

                        {/* Lọc Giá */}
                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 10 }}>Khoảng giá</h4>
                            <Slider 
                                range 
                                min={0} 
                                max={50000000} 
                                step={1000000}
                                defaultValue={[0, 50000000]} 
                                onChange={(value) => setPriceRange(value)}
                                tooltip={{ formatter: value => `${(value/1000000)} tr` }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                                <span>{priceRange[0].toLocaleString()} đ</span>
                                <span>{priceRange[1].toLocaleString()} đ</span>
                            </div>
                        </div>

                        <Button type="primary" block onClick={() => { 
                            setSelectedBrands([]); 
                            setPriceRange([0, 50000000]); 
                            navigate('/'); // Xóa cả từ khóa tìm kiếm trên URL
                        }}>
                            Xóa tất cả bộ lọc
                        </Button>
                    </Card>
                </Col>

                {/* --- CỘT PHẢI: DANH SÁCH SẢN PHẨM --- */}
                <Col xs={24} sm={24} md={18} lg={19}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                        <Title level={3} style={{ margin: 0, borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>
                            {searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : 'Tất cả sản phẩm'} 
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
                                                        // Ưu tiên lấy thumbnail, nếu ko có thì lấy ảnh đầu tiên trong mảng images, nếu ko có nữa thì fallback ảnh rỗng
                                                        src={product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image')} 
                                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} 
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }} // Xử lý nếu link ảnh chết
                                                    />
                                                    <Tag color="#f50" style={{ position: 'absolute', top: 10, right: 10, borderRadius: 4 }}>HOT</Tag>
                                                </div>
                                            }
                                            actions={[
                                                <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/product/${product.id}`)}>
                                                    Chi tiết
                                                </Button>,
                                                <Button 
                                                    type="primary" 
                                                    icon={<ShoppingCartOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn việc click nút này mà nó nhảy sang trang detail
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
                                                            <Tag style={{marginRight:0}}>{product.cpu}</Tag>
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
                    onClick={() => window.open('https://www.facebook.com/your-page', '_blank')} 
                />
                
                {/* 4. Nút cuộn lên đầu trang (Tiện ích thêm) */}
                <FloatButton.BackTop visibilityHeight={0} icon={<VerticalAlignTopOutlined />} />
            </FloatButton.Group>
            
        </div>
    );
};

export default Home;