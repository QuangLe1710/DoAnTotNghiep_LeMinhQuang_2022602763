import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, theme, notification, Badge, Popover, List, Avatar, Typography } from 'antd'; // Import thêm Popover, List, Avatar, Typography
import { LaptopOutlined, LogoutOutlined, DashboardOutlined, ShoppingOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    // --- LOGIC THÔNG BÁO ---
    const [pendingOrders, setPendingOrders] = useState([]); // Lưu danh sách đơn chờ (thay vì chỉ lưu số lượng)
    const audioRef = useRef(new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3')); 
    // Mẹo: Lưu độ dài cũ để so sánh xem có đơn mới không
    const prevCountRef = useRef(0); 

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Gọi API lấy danh sách đơn chờ
                const response = await api.get('/orders/pending-orders');
                const currentOrders = response.data;
                
                setPendingOrders(currentOrders);

                // Nếu số lượng tăng lên -> Có đơn mới -> Báo chuông
                if (currentOrders.length > prevCountRef.current && prevCountRef.current !== 0) {
                    audioRef.current.play().catch(() => {});
                    notification.success({
                        message: 'ĐƠN HÀNG MỚI!',
                        description: `Vừa có khách đặt hàng. Tổng đơn chờ: ${currentOrders.length}`,
                        placement: 'bottomRight', // Đổi vị trí xuống dưới cho đỡ che menu
                    });
                }

                // Cập nhật lại số lượng cũ để dùng cho lần sau
                prevCountRef.current = currentOrders.length;

            } catch (error) {
                console.error("Lỗi polling", error);
            }
        };

        fetchNotifications(); // Gọi ngay lần đầu
        const interval = setInterval(fetchNotifications, 3000); // Lặp lại mỗi 3s

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // --- NỘI DUNG DANH SÁCH THÔNG BÁO (POPOVER CONTENT) ---
    const notificationContent = (
        <div style={{ width: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text strong>Đơn hàng chờ duyệt ({pendingOrders.length})</Text>
                <Button type="link" size="small" onClick={() => navigate('/admin/orders')}>Xem tất cả</Button>
            </div>
            
            <List
                itemLayout="horizontal"
                dataSource={pendingOrders.slice(0, 5)} // Chỉ hiện 5 đơn mới nhất
                renderItem={(item) => (
                    <List.Item 
                        onClick={() => navigate('/admin/orders')} // Click vào thì chuyển tới trang quản lý
                        style={{ cursor: 'pointer', transition: 'background 0.3s', padding: '10px', borderRadius: '4px' }}
                        className="notification-item" // Có thể thêm CSS hover nếu thích
                    >
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#f56a00' }}>{item.customerName?.charAt(0).toUpperCase()}</Avatar>}
                            title={<span style={{fontSize: '13px'}}>Đơn #{item.id} - {item.customerName}</span>}
                            description={
                                <div>
                                    <div style={{color: '#cf1322', fontWeight: 'bold'}}>{item.totalAmount?.toLocaleString()} đ</div>
                                    <div style={{fontSize: '11px', color: '#888'}}>{new Date(item.createdAt).toLocaleString()}</div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: "Không có đơn hàng mới" }}
            />
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {collapsed ? <img src="/MyLap.png" alt="Logo" style={{ height: '20px', width: 'auto' }} /> : <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Hello, ADMIN</span>}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    onClick={({ key }) => navigate(key)}
                    items={[
                        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                        { key: '/admin/products', icon: <LaptopOutlined />, label: 'Quản lý Sản phẩm' },
                        { 
                            key: '/admin/orders', 
                            icon: <ShoppingOutlined />, 
                            label: (
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span>Quản lý Đơn hàng</span>
                                    {pendingOrders.length > 0 && <Badge count={pendingOrders.length} size="small" offset={[10, 0]} />}
                                </div>
                            )
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    
                    {/* --- CHUÔNG THÔNG BÁO (POPOVER) --- */}
                    <Popover 
                        content={notificationContent} 
                        trigger="click" 
                        placement="bottomRight"
                        arrow
                    >
                        <div style={{ marginRight: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Badge count={pendingOrders.length} offset={[0, 5]}>
                                <BellOutlined style={{ fontSize: 22, color: '#555' }} />
                            </Badge>
                        </div>
                    </Popover>

                    <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
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