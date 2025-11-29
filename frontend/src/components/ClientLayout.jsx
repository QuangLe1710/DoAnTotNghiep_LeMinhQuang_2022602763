import React from 'react';
import { Layout, Input, Badge, Button, Avatar, Dropdown, Space, FloatButton } from 'antd';
// 1. Thêm GiftOutlined vào import
import { ShoppingCartOutlined, UserOutlined, LaptopOutlined, LogoutOutlined, DashboardOutlined, ShoppingOutlined, CustomerServiceOutlined, PhoneOutlined, FacebookOutlined, MessageOutlined, VerticalAlignTopOutlined, DiffOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import CompareModal from './CompareModal';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const ClientLayout = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { openCompareModal, compareList } = useCompare();
    
    // Logic lấy User (Giữ nguyên code cũ của bạn)
    const [user, setUser] = React.useState(() => {
        const username = localStorage.getItem('username');
        const fullName = localStorage.getItem('fullName');
        const roles = localStorage.getItem('roles');
        if (username) {
            return { 
                username, 
                fullName, 
                role: roles && roles.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER' 
            };
        }
        return null;
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
            const username = localStorage.getItem('username');
            if (username) {
                setUser({
                    username,
                    fullName: localStorage.getItem('fullName'),
                    role: localStorage.getItem('roles')?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER'
                });
            } else {
                setUser(null);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('roles');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const onSearch = (value) => {
        if (value.trim()) {
            navigate(`/?search=${encodeURIComponent(value.trim())}`);
        } else {
            navigate('/');
        }
    };

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
                label: <Link to="/history">Lịch sử đơn hàng</Link>,
                icon: <ShoppingOutlined />
            },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                onClick: handleLogout
            },
            {
                key: 'profile',
                label: <Link to="/profile">Tài khoản của tôi</Link>,
                icon: <UserOutlined />
            },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '0 50px' }}>
                
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
                    {/* --- 2. ĐẶT NÚT MÃ GIẢM GIÁ Ở ĐÂY (NGOÀI KHỐI ĐIỀU KIỆN USER) --- */}
                    <Button 
                        type="text" 
                        icon={<GiftOutlined style={{ fontSize: 20, color: '#cf1322' }} />} 
                        onClick={() => navigate('/vouchers')}
                        style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                    >
                        Mã giảm giá
                    </Button>

                    <Badge count={cartCount} showZero>
                        <Button 
                            shape="circle" 
                            icon={<ShoppingCartOutlined />} 
                            size="large" 
                            onClick={() => navigate('/cart')} 
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

            {/* Float Buttons */}
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{ right: 24, bottom: 24 }}
                icon={<CustomerServiceOutlined />}
                tooltip={<div>Cần hỗ trợ?</div>}
            >
                <FloatButton 
                    icon={<PhoneOutlined />} 
                    tooltip={<div>Hotline: 0348.773.921</div>}
                    onClick={() => window.open('tel:0348773921')} 
                />
                <FloatButton 
                    icon={<MessageOutlined />} 
                    tooltip={<div>Chat Zalo</div>}
                    onClick={() => window.open('https://zalo.me/0348773921', '_blank')} 
                />
                <FloatButton 
                    icon={<FacebookOutlined />} 
                    tooltip={<div>Fanpage Facebook</div>}
                    onClick={() => window.open('https://www.facebook.com/lomo.quang.9/', '_blank')} 
                />
                <FloatButton 
                    icon={<DiffOutlined />} 
                    badge={{ count: compareList.length, color: 'red' }}
                    tooltip={<div>So sánh sản phẩm</div>}
                    onClick={openCompareModal}
                />
                <FloatButton.BackTop visibilityHeight={0} icon={<VerticalAlignTopOutlined />} />
            </FloatButton.Group>
        </Layout>
    );
};

export default ClientLayout;