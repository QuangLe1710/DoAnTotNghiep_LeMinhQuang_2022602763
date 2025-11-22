import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, LaptopOutlined } from '@ant-design/icons'; // Thêm icon Laptop
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

const Register = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Dùng hook để reset form sau khi submit

    const onFinish = async (values) => {
        try {
            await api.post('/auth/register', values);
            message.success("Đăng ký thành công! Hãy đăng nhập.");
            form.resetFields(); // Xóa trắng form
            navigate('/login'); 
        } catch (error) {
            message.error(error.response?.data || "Đăng ký thất bại! Vui lòng thử lại.");
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            width: '100vw', // Full chiều ngang
            backgroundColor: '#f0f2f5',
            backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")', // Hình nền giống Login
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 110%',
            backgroundSize: '100%',
        }}>
            <Card 
                style={{ 
                    width: 450, // Rộng hơn Login một chút vì nhiều trường hơn
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', // Bóng đổ mềm
                    borderRadius: '8px',
                    padding: '20px 10px'
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    {/* Logo giả lập giống Login */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                        <LaptopOutlined style={{ fontSize: '40px', color: '#1890ff', marginRight: 10 }} />
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>MyLap</Title>
                    </div>
                    <Text type="secondary">Tạo tài khoản mới để bắt đầu mua sắm</Text>
                </div>
                
                <Form 
                    form={form}
                    name="register" 
                    onFinish={onFinish} 
                    layout="vertical" 
                    size="large"
                    scrollToFirstError
                >
                    
                    <Form.Item 
                        name="username" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự!' },
                            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ được chứa chữ, số và dấu gạch dưới!' }
                        ]}
                        hasFeedback
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item 
                        name="fullName" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        hasFeedback
                    >
                        <Input prefix={<IdcardOutlined className="site-form-item-icon" />} placeholder="Họ và tên đầy đủ" />
                    </Form.Item>

                    <Form.Item 
                        name="email" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                        hasFeedback
                    >
                        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item 
                        name="password" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu" />
                    </Form.Item>

                    {/* Thêm trường Nhập lại mật khẩu cho chuyên nghiệp */}
                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 30 }}>
                        <Button type="primary" htmlType="submit" block style={{ height: '45px', fontWeight: 'bold' }}>
                            ĐĂNG KÝ TÀI KHOẢN
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        Bạn đã có tài khoản? <Link to="/login" style={{ fontWeight: '500' }}>Đăng nhập ngay</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;