import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { LaptopOutlined, UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const navigate = useNavigate();
    // 1. Tạo state để theo dõi trạng thái đóng/mở của Sider
    const [collapsed, setCollapsed] = useState(false); 
    
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)} // Cập nhật state khi bấm nút thu nhỏ
            >
                {/* --- PHẦN LOGO TÙY BIẾN --- */}
                <div style={{ 
                    height: 32, 
                    margin: 16, 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden' // Ẩn phần thừa nếu ảnh to
                }}>
                    {collapsed ? (
                        // 2. Khi thu nhỏ: Hiển thị Ảnh Logo
                        <img 
                            src="/MyLap.png" 
                            alt="Logo" 
                            style={{ height: '20px', width: 'auto' }} 
                        />
                    ) : (
                        // 3. Khi mở rộng: Hiển thị Chữ
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                            Hello, ADMIN
                        </span>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    onClick={({ key }) => navigate(key)}
                    items={[
                        {
                            key: '/admin/dashboard',
                            icon: <DashboardOutlined />,
                            label: 'Dashboard',
                        },
                        {
                            key: '/admin/products',
                            icon: <LaptopOutlined />,
                            label: 'Quản lý Sản phẩm',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;