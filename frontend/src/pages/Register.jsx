import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi (loại bỏ confirmPassword nếu có)
      const registerData = {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone
      };

      // Gọi API đăng ký
      await api.post("/auth/register", registerData);
      
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      
      // Chuyển hướng sang trang Login sau 1s
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      const errorMsg = error.response?.data || "Đăng ký thất bại!";
      message.error(typeof errorMsg === 'string' ? errorMsg : "Lỗi hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "90vh",
      backgroundColor: "#f0f2f5" 
    }}>
      <Card style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#1890ff" }}>Đăng Ký</Title>
          <Text type="secondary">Tạo tài khoản thành viên MyLap</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="username123" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@mail.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0909xxxxxx" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên!" }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
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
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng Ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text>Đã có tài khoản? </Text>
            <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;