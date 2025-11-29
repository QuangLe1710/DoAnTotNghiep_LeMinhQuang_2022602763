import React, { useEffect, useState } from 'react';
import { Table, Tag, Switch, message, Typography, Avatar, Input, Card } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // 1. Load danh sách User
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            // Lọc bớt Admin ra khỏi danh sách nếu muốn (hoặc để hiển thị cho vui)
            setUsers(res.data);
        } catch (error) {
            message.error("Lỗi tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. Xử lý khóa/mở tài khoản
    const handleStatusChange = async (userId, checked) => {
        try {
            await api.put(`/users/${userId}/status`, { status: checked });
            message.success(checked ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!");
            
            // Cập nhật state UI ngay lập tức
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: checked } : u));
        } catch (error) {
            message.error("Lỗi cập nhật trạng thái!");
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        { 
            title: 'Tài khoản', 
            render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar icon={<UserOutlined />} src={r.avatar} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{r.username}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
                    </div>
                </div>
            )
        },
        { title: 'Họ tên', dataIndex: 'fullName' },
        { title: 'SĐT', dataIndex: 'phone' },
        { 
            title: 'Vai trò', 
            dataIndex: 'roles',
            render: (roles) => roles.map(role => {
                const color = role === 'ROLE_ADMIN' ? 'volcano' : 'blue';
                return <Tag color={color} key={role}>{role.replace('ROLE_', '')}</Tag>;
            })
        },
        { 
            title: 'Ngày tham gia', 
            dataIndex: 'createdAt', 
            render: d => dayjs(d).format('DD/MM/YYYY'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            render: (status, record) => (
                <Switch 
                    checked={status} 
                    checkedChildren="Active" 
                    unCheckedChildren="Ban" 
                    onChange={(checked) => handleStatusChange(record.id, checked)}
                    // Không cho phép khóa chính Admin đang đăng nhập (check qua roles hoặc logic khác)
                    disabled={record.roles.includes('ROLE_ADMIN')}
                />
            )
        }
    ];

    // Lọc dữ liệu theo tìm kiếm
    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchText.toLowerCase()) || 
        u.email.toLowerCase().includes(searchText.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <Title level={2} style={{ marginBottom: 20 }}>Quản lý Người dùng</Title>
            
            <Card style={{ marginBottom: 20 }}>
                <Input 
                    prefix={<SearchOutlined />} 
                    placeholder="Tìm kiếm theo tên, email, username..." 
                    onChange={e => setSearchText(e.target.value)}
                    style={{ maxWidth: 400 }}
                />
            </Card>

            <Table 
                columns={columns} 
                dataSource={filteredUsers} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 8 }}
                bordered
            />
        </div>
    );
};

export default AdminUser;