import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Typography, message, Tag, Spin, Empty } from 'antd';
import { GiftOutlined, CopyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const VoucherHub = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const res = await api.get('/vouchers/active');
                setVouchers(res.data);
            } catch (error) {
                message.error("Lỗi tải danh sách voucher");
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        message.success(`Đã copy mã: ${code}`);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '30px 50px', minHeight: '80vh', background: '#f0f2f5' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ color: '#cf1322' }}>
                    <GiftOutlined /> KHO VOUCHER ƯU ĐÃI
                </Title>
                <Text type="secondary">Săn ngay mã giảm giá hot nhất hôm nay!</Text>
            </div>

            {vouchers.length === 0 ? (
                <Empty description="Hiện chưa có mã giảm giá nào" />
            ) : (
                <Row gutter={[24, 24]}>
                    {vouchers.map((v) => (
                        <Col xs={24} md={12} lg={8} key={v.id}>
                            <Card 
                                hoverable 
                                style={{ 
                                    borderRadius: 12, 
                                    border: '1px solid #ffccc7',
                                    background: 'linear-gradient(to right, #fff0f6, #fff)' 
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <Tag color="red" style={{ fontSize: 16, padding: '5px 10px', marginBottom: 10 }}>
                                            {v.code}
                                        </Tag>
                                        <Title level={4} style={{ margin: '5px 0', color: '#cf1322' }}>
                                            Giảm {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()} đ`}
                                        </Title>
                                        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                                            Đơn tối thiểu: {v.minOrderValue?.toLocaleString()} đ
                                        </Text>
                                        <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
                                            <ClockCircleOutlined /> HSD: {v.endDate ? dayjs(v.endDate).format('DD/MM/YYYY') : 'Vĩnh viễn'}
                                        </div>
                                    </div>
                                    <Button 
                                        type="primary" 
                                        icon={<CopyOutlined />} 
                                        shape="round" 
                                        onClick={() => handleCopy(v.code)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                                
                                {/* Thanh tiến trình sử dụng (giả lập cho đẹp) */}
                                <div style={{ marginTop: 15, background: '#e6f7ff', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${Math.min((v.usageCount / (v.maxUsage || 100)) * 100, 100)}%`, 
                                        background: '#1890ff', 
                                        height: '100%' 
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 5 }}>
                                    <span>Đã dùng: {Math.round((v.usageCount / (v.maxUsage || 100)) * 100)}%</span>
                                    <span>SL có hạn</span>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default VoucherHub;