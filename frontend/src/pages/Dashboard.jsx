import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Select, Space, message } from 'antd'; // Import thêm message
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
    
    const [numMonths, setNumMonths] = useState(6);
    const [chartData, setChartData] = useState([]);

    // 1. Tải thống kê tổng (Giữ nguyên)
    useEffect(() => {
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

    // 2. [SỬA] Tải dữ liệu biểu đồ từ API thực tế
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                // Gọi API mới viết ở Backend
                const response = await api.get(`/dashboard/revenue?months=${numMonths}`);
                setChartData(response.data);
            } catch (error) {
                message.error("Không thể tải biểu đồ doanh thu");
            }
        };

        fetchChartData();
    }, [numMonths]); // Chạy lại khi numMonths thay đổi

    const handleMonthChange = (value) => {
        setNumMonths(value);
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
            
            <Row gutter={16} style={{ marginBottom: 30 }}>
                {/* ... Các thẻ Statistic giữ nguyên ... */}
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#e6f7ff' }}>
                        <Statistic title="Tổng Người dùng" value={stats.totalUsers} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#f6ffed' }}>
                        <Statistic title="Tổng Sản phẩm" value={stats.totalProducts} prefix={<ShoppingOutlined />} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ backgroundColor: '#fff7e6' }}>
                        <Statistic title="Tổng Đơn hàng" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#fa8c16' }} />
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

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={4} style={{ margin: 0 }}>Biểu đồ doanh thu thực tế</Title>
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
                            <YAxis 
                                tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} 
                                width={80}
                            />
                            <Tooltip 
                                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} 
                                labelStyle={{ color: '#333' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Doanh thu" fill="#1890ff" barSize={50} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;