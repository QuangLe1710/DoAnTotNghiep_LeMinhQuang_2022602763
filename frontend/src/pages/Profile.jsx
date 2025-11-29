import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Card, message, List, Tag, Modal, Space, Avatar, Typography } from 'antd';
import { UserOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, StarFilled, LockOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

const Profile = () => {
    // State cho Profile
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // State cho Address
    const [addresses, setAddresses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [form] = Form.useForm();

    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [passForm] = Form.useForm();

    const handleChangePassword = async (values) => {
        try {
            await api.put('/users/change-password', values);
            message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            setIsPassModalOpen(false);
            passForm.resetFields();
            // Tùy chọn: Đăng xuất luôn để user đăng nhập lại với pass mới
            // localStorage.removeItem('token'); navigate('/login');
        } catch (error) {
            message.error(error.response?.data || "Lỗi đổi mật khẩu!");
        }
    };

    // 1. Load dữ liệu
    const fetchData = async () => {
        try {
            const [userRes, addrRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/addresses')
            ]);
            setUser(userRes.data);
            setAddresses(addrRes.data);
        } catch (error) {
            message.error("Lỗi tải thông tin!");
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- TAB 1: XỬ LÝ PROFILE ---
    const handleUpdateProfile = async (values) => {
        setLoadingUser(true);
        try {
            await api.put('/users/profile', values);
            message.success("Cập nhật hồ sơ thành công!");
            
            // Cập nhật lại localStorage để Header hiển thị đúng tên mới
            localStorage.setItem('fullName', values.fullName);
            window.dispatchEvent(new Event('auth-change'));
            
            fetchData();
        } catch (error) {
            message.error("Lỗi cập nhật!");
        } finally {
            setLoadingUser(false);
        }
    };

    // --- TAB 2: XỬ LÝ ĐỊA CHỈ ---
    const handleSaveAddress = async (values) => {
        try {
            if (editingAddress) {
                await api.put(`/addresses/${editingAddress.id}`, values);
                message.success("Đã cập nhật địa chỉ!");
            } else {
                await api.post('/addresses', values);
                message.success("Thêm địa chỉ thành công!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error("Có lỗi xảy ra!");
        }
    };

    const handleDeleteAddress = async (id) => {
        if(!window.confirm("Bạn muốn xóa địa chỉ này?")) return;
        try {
            await api.delete(`/addresses/${id}`);
            message.success("Đã xóa!");
            fetchData();
        } catch (e) { message.error("Không thể xóa địa chỉ này!"); }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.put(`/addresses/${id}/default`);
            message.success("Đã đặt làm mặc định!");
            fetchData();
        } catch (e) { message.error("Lỗi!"); }
    };

    const openAddressModal = (addr = null) => {
        setEditingAddress(addr);
        form.setFieldsValue(addr || { isDefault: false });
        setIsModalOpen(true);
    };

    // --- GIAO DIỆN ---
    const ProfileTab = () => (
        <Form layout="vertical" onFinish={handleUpdateProfile} initialValues={user}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar size={100} icon={<UserOutlined />} src={user?.avatar} />
                <div style={{ marginTop: 10 }}>
                    <Tag color="blue">{user?.username}</Tag>
                    <Tag color="purple">{user?.roles?.[0]?.name || "MEMBER"}</Tag>
                </div>
            </div>
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="email" label="Email" >
                <Input disabled />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingUser} block>Lưu thay đổi</Button>

            {/* Nút Đổi mật khẩu mới */}
            <Button type="default" danger block onClick={() => setIsPassModalOpen(true)}>
                Đổi mật khẩu
            </Button>
        </Form>
    );

    const AddressTab = () => (
        <div>
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => openAddressModal()} style={{ marginBottom: 20 }}>
                Thêm địa chỉ mới
            </Button>
            <List
                itemLayout="horizontal"
                dataSource={addresses}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            !item.isDefault && <Button type="link" size="small" onClick={() => handleSetDefault(item.id)}>Đặt mặc định</Button>,
                            <Button type="text" icon={<EditOutlined />} onClick={() => openAddressModal(item)} />,
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAddress(item.id)} />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<HomeOutlined style={{ fontSize: 24, color: item.isDefault ? '#1890ff' : '#ccc' }} />}
                            title={
                                <Space>
                                    <Text strong>{item.receiverName}</Text>
                                    <Text type="secondary">({item.phone})</Text>
                                    {item.isDefault && <Tag color="blue" icon={<StarFilled />}>Mặc định</Tag>}
                                </Space>
                            }
                            description={`${item.detailAddress}, ${item.city}`}
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <div style={{ padding: '30px', maxWidth: 800, margin: '0 auto' }}>
            <Card>
                <Tabs defaultActiveKey="1" items={[
                    { key: '1', label: 'Thông tin cá nhân', children: <ProfileTab /> },
                    { key: '2', label: 'Sổ địa chỉ', children: <AddressTab /> },
                ]} />
            </Card>

            {/* Modal Thêm/Sửa Địa chỉ */}
            <Modal
                title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleSaveAddress} layout="vertical">
                    <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true }]}>
                        <Input placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                        <Input placeholder="VD: 0909..." />
                    </Form.Item>
                    <Form.Item name="city" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                        <Input placeholder="VD: Hà Nội" />
                    </Form.Item>
                    <Form.Item name="detailAddress" label="Địa chỉ chi tiết" rules={[{ required: true }]}>
                        <Input.TextArea placeholder="Số nhà, tên đường..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu địa chỉ</Button>
                </Form>
            </Modal>

            {/* Modal Đổi mật khẩu */}
            <Modal
                title="Đổi mật khẩu"
                open={isPassModalOpen}
                onCancel={() => setIsPassModalOpen(false)}
                footer={null}
            >
                <Form form={passForm} onFinish={handleChangePassword} layout="vertical">
                    <Form.Item 
                        name="oldPassword" 
                        label="Mật khẩu hiện tại" 
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item 
                        name="newPassword" 
                        label="Mật khẩu mới" 
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item 
                        name="confirmPassword" 
                        label="Xác nhận mật khẩu mới" 
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>Xác nhận đổi</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;