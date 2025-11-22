import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, LaptopOutlined } from '@ant-design/icons'; // Thêm icon Laptop
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await api.post('/auth/login', values);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username,
                role: response.data.role
            }));

            message.success("Đăng nhập thành công!");
            navigate('/'); 
        } catch (error) {
            message.error("Sai tên đăng nhập hoặc mật khẩu!");
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            width: '100vw', // Đảm bảo chiếm full chiều ngang
            backgroundColor: '#f0f2f5',
            backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")', // Thêm hình nền nhẹ (tùy chọn)
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 110%',
            backgroundSize: '100%',
        }}>
            <Card 
                style={{ 
                    width: 400, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', // Bóng đổ mềm mại hơn
                    borderRadius: '8px' 
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    {/* Logo giả lập */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                        <LaptopOutlined style={{ fontSize: '40px', color: '#1890ff', marginRight: 10 }} />
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>MyLap</Title>
                    </div>
                    <Text type="secondary">Làm chủ thế giới laptop của bạn</Text>
                </div>

                <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}>
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 10 }}>
                        <Button type="primary" htmlType="submit" block style={{ height: '45px', fontWeight: 'bold' }}>
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        Chưa có tài khoản? <Link to="/register" style={{ fontWeight: '500' }}>Đăng ký ngay</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;