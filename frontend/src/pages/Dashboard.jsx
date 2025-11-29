import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, UserOutlined, ShopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/chart')
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div>;

    return (
        <div>
            <Title level={2} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>
            
            {/* 1. CÁC THẺ THỐNG KÊ (CARDS) */}
            <Row gutter={16} style={{ marginBottom: 30 }}>
                <Col span={4}>
                    <Card>
                        <Statistic 
                            title="Doanh thu" 
                            value={stats.totalRevenue} 
                            prefix={<DollarCircleOutlined />} 
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            formatter={(val) => val?.toLocaleString() + ' đ'}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic 
                            title="Đơn hàng" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined />} 
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic 
                            title="Đơn chờ duyệt" 
                            value={stats.pendingOrders} 
                            prefix={<ClockCircleOutlined />} 
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic 
                            title="Sản phẩm" 
                            value={stats.totalProducts} 
                            prefix={<ShopOutlined />} 
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic 
                            title="Khách hàng" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined />} 
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 2. BIỂU ĐỒ DOANH THU */}
            <Card title="Biểu đồ doanh thu theo tháng">
                <div style={{ width: '100%', height: 400 }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                                <Legend />
                                <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="#1890ff" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{textAlign: 'center', lineHeight: '400px', color: '#888'}}>Chưa có dữ liệu doanh thu</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;