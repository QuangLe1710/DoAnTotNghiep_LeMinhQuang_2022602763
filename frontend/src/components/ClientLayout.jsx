import React from 'react';
import { Layout, Input, Badge, Button, Avatar, Dropdown, Space } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LaptopOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, Link } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const ClientLayout = () => {
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // --- HÀM XỬ LÝ TÌM KIẾM (MỚI) ---
    const onSearch = (value) => {
        if (value.trim()) {
            // Chuyển hướng về trang chủ kèm tham số ?search=...
            navigate(`/?search=${encodeURIComponent(value.trim())}`);
        } else {
            // Nếu xóa trắng thì về trang chủ gốc
            navigate('/');
        }
    };

    const userMenu = {
        items: [
            ...(user?.role === 'ADMIN' ? [{
                key: 'admin',
                label: <Link to="/admin/dashboard">Vào trang Quản trị</Link>,
                icon: <DashboardOutlined />
            }] : []),
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                onClick: handleLogout
            }
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
                        onSearch={onSearch} // <--- GẮN HÀM TÌM KIẾM VÀO ĐÂY
                    />
                </div>

                <Space size="large">
                    <Badge count={0} showZero>
                        <Button shape="circle" icon={<ShoppingCartOutlined />} size="large" />
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
        </Layout>
    );
};

export default ClientLayout;