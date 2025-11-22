import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Select, Space } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    
    // State lưu số tháng muốn xem (Mặc định 6 tháng)
    const [numMonths, setNumMonths] = useState(6);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // 1. Gọi API lấy số liệu thống kê tổng (giữ nguyên)
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.log("Lỗi tải thống kê");
            }
        };
        fetchStats();
    }, []);

    // 2. Khi số tháng thay đổi -> Tính toán lại dữ liệu biểu đồ
    useEffect(() => {
        const data = [];
        const today = new Date();
        
        // Vòng lặp lùi thời gian để tạo dữ liệu
        for (let i = numMonths - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = `Tháng ${d.getMonth() + 1}`; // Lấy tên tháng (1-12)
            
            // Random doanh thu giả lập từ 10tr đến 50tr để demo
            // Sau này có DB thật thì thay bằng API
            const randomRevenue = Math.floor(Math.random() * (50000000 - 10000000) + 10000000);
            
            data.push({
                name: monthName,
                revenue: randomRevenue
            });
        }
        setChartData(data);
    }, [numMonths]); // Chạy lại mỗi khi numMonths thay đổi

    const handleMonthChange = (value) => {
        setNumMonths(value);
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
            
            {/* 4 THẺ THỐNG KÊ (Giữ nguyên) */}
            <Row gutter={16} style={{ marginBottom: 30 }}>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#e6f7ff' }}>
                        <Statistic 
                            title="Tổng Người dùng" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined />} 
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#f6ffed' }}>
                        <Statistic 
                            title="Tổng Sản phẩm" 
                            value={stats.totalProducts} 
                            prefix={<ShoppingOutlined />} 
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#fff7e6' }}>
                        <Statistic 
                            title="Tổng Đơn hàng" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined />} 
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#fff1f0' }}>
                        <Statistic 
                            title="Doanh thu (VNĐ)" 
                            value={stats.totalRevenue} 
                            prefix={<DollarCircleOutlined />} 
                            valueStyle={{ color: '#cf1322' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Card>
                </Col>
            </Row>

            {/* KHUNG BIỂU ĐỒ */}
            <Card>
                {/* Header của Card: Tiêu đề bên trái, Select box bên phải */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={4} style={{ margin: 0 }}>Biểu đồ doanh thu</Title>
                    
                    <Space>
                        <span>Thời gian:</span>
                        <Select defaultValue={6} style={{ width: 120 }} onChange={handleMonthChange}>
                            <Option value={3}>3 tháng gần nhất</Option>
                            <Option value={6}>6 tháng gần nhất</Option>
                            <Option value={9}>9 tháng gần nhất</Option>
                            <Option value={12}>1 năm qua</Option>
                        </Select>
                    </Space>
                </div>

                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} width={80}/>
                            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                            <Legend />
                            <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;