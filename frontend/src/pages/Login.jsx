import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Gọi API Login
      const res = await api.post("/auth/login", values);
      
      // 2. Lấy dữ liệu từ response
      // Cấu trúc response mới: { token, username, fullName, roles: ["ROLE_ADMIN", ...] }
      const { token, username, fullName, roles } = res.data;

      // 3. Lưu vào LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("fullName", fullName);
      // Lưu roles dưới dạng chuỗi JSON để dễ lấy lại
      localStorage.setItem("roles", JSON.stringify(roles));

      message.success("Đăng nhập thành công!");

      window.dispatchEvent(new Event('auth-change'));

      // 4. Điều hướng dựa trên quyền (Role)
      // Luôn chuyển về trang chủ (Home) cho mọi tài khoản (kể cả Admin)
      navigate("/");
      
      // Bắn sự kiện để Header (ClientLayout) cập nhật lại tên user ngay lập tức
      window.dispatchEvent(new Event('auth-change'));
      
      // Reload nhẹ để Header cập nhật trạng thái (User name)
      window.location.reload(); 

    } catch (error) {
      // Xử lý lỗi trả về từ Backend
      const errorMsg = error.response?.data || "Đăng nhập thất bại!";
      message.error(typeof errorMsg === 'string' ? errorMsg : "Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "80vh",
      backgroundColor: "#f0f2f5" 
    }}>
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#1890ff" }}>MyLap</Title>
          <Text type="secondary">Đăng nhập để tiếp tục mua sắm</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Tên đăng nhập" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mật khẩu" 
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text>Chưa có tài khoản? </Text>
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;