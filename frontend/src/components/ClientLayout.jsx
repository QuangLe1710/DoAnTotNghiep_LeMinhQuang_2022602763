import React from 'react';
import { Layout, Input, Badge, Button, Avatar, Dropdown, Space, FloatButton } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LaptopOutlined, LogoutOutlined, DashboardOutlined, ShoppingOutlined, CustomerServiceOutlined, PhoneOutlined, FacebookOutlined, MessageOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <--- 1. IMPORT CART CONTEXT
import { useCompare } from '../context/CompareContext'; // Import context
import CompareModal from './CompareModal'; // Import Modal vừa tạo
import { DiffOutlined } from '@ant-design/icons'; // Icon so sánh

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const ClientLayout = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart(); // <--- 2. LẤY CART ITEMS TỪ CONTEXT
    const { openCompareModal, compareList } = useCompare(); // Lấy hàm mở modal
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const onSearch = (value) => {
        if (value.trim()) {
            navigate(`/?search=${encodeURIComponent(value.trim())}`);
        } else {
            navigate('/');
        }
    };

    // Tính tổng số lượng sản phẩm (Ví dụ: mua 2 cái iPhone thì hiện số 2)
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const userMenu = {
        items: [
            ...(user?.role === 'ADMIN' ? [{
                key: 'admin',
                label: <Link to="/admin/dashboard">Vào trang Quản trị</Link>,
                icon: <DashboardOutlined />
            }] : []),
            {
                key: 'history',
                label: <Link to="/history">Lịch sử đơn hàng</Link>, // <--- THÊM MỤC NÀY
                icon: <ShoppingOutlined /> // Nhớ import icon nếu cần
            },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                onClick: handleLogout
            },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ /* ...giữ nguyên style cũ... */ position: 'sticky', top: 0, zIndex: 100, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '0 50px' }}>
                
                <div className="logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <LaptopOutlined style={{ fontSize: '32px', color: '#1890ff', marginRight: 10 }} />
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', letterSpacing: '1px' }}>MyLap</span>
                </div>

                <div style={{ width: '40%', maxWidth: '600px' }}>
                    <Search 
                        placeholder="Bạn muốn tìm Laptop gì hôm nay?..." 
                        allowClear 
                        enterButton="Tìm kiếm" 
                        size="large" 
                        onSearch={onSearch}
                    />
                </div>

                <Space size="large">
                    {/* 3. SỬA BADGE: Thay số 0 cứng bằng biến cartCount */}
                    <Badge count={cartCount} showZero>
                        <Button 
                            shape="circle" 
                            icon={<ShoppingCartOutlined />} 
                            size="large" 
                            onClick={() => navigate('/cart')} // Thêm sự kiện bấm vào icon thì chuyển sang trang giỏ hàng
                        />
                    </Badge>

                    {user ? (
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: '6px', transition: '0.3s' }}>
                                <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} icon={<UserOutlined />} size="large" />
                                <span style={{ marginLeft: 10, fontWeight: 600, fontSize: '16px', color: '#333' }}>{user.username}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <Space>
                            <Button type="text" onClick={() => navigate('/login')} style={{ fontWeight: 500 }}>Đăng nhập</Button>
                            <Button type="primary" onClick={() => navigate('/register')} style={{ fontWeight: 500, borderRadius: '4px' }}>Đăng ký</Button>
                        </Space>
                    )}
                </Space>
            </Header>

            <Content style={{ padding: '30px 50px', backgroundColor: '#f0f2f5' }}>
                <div style={{ minHeight: 'calc(100vh - 64px - 70px)' }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '30px 50px' }}>
                <div style={{ marginBottom: 10 }}>
                    <LaptopOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 10 }} />
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>MyLap Store</span>
                </div>
                MyLap ©2025 Created by Le Minh Quang - Đồ án tốt nghiệp Công nghệ thông tin
            </Footer>

            <CompareModal />

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

                {/* --- [THÊM NÚT SO SÁNH] --- */}
                <FloatButton 
                    icon={<DiffOutlined />} 
                    badge={{ count: compareList.length, color: 'red' }} // Hiện số lượng đang so sánh
                    tooltip={<div>So sánh sản phẩm</div>}
                    onClick={openCompareModal}
                />
                
                {/* 4. Nút cuộn lên đầu trang (Tiện ích thêm) */}
                <FloatButton.BackTop visibilityHeight={0} icon={<VerticalAlignTopOutlined />} />
            </FloatButton.Group>
        </Layout>
    );
};

export default ClientLayout;