import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Image } from 'antd'; // 1. Import thêm Image
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const AdminBrand = () => {
    const [brands, setBrands] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [form] = Form.useForm();

    const fetchBrands = async () => {
        try {
            const res = await api.get('/brands');
            setBrands(res.data);
        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleSave = async (values) => {
        try {
            if (editingBrand) {
                await api.put(`/brands/${editingBrand.id}`, values);
                message.success("Cập nhật thành công");
            } else {
                await api.post('/brands', values);
                message.success("Thêm mới thành công");
            }
            setIsModalOpen(false);
            fetchBrands();
        } catch (error) {
            message.error("Lỗi lưu dữ liệu");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa thương hiệu này?")) return;
        try {
            await api.delete(`/brands/${id}`);
            message.success("Đã xóa");
            fetchBrands();
        } catch (e) { message.error("Lỗi xóa (Có thể đang có SP thuộc hãng này)"); }
    };

    const openModal = (record = null) => {
        setEditingBrand(record);
        // Map dữ liệu vào form (Lưu ý trường logoUrl khớp với Entity Java)
        form.setFieldsValue(record || { name: '', origin: '', logoUrl: '' });
        setIsModalOpen(true);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
        { 
            title: 'Logo', 
            dataIndex: 'logoUrl', 
            width: 100,
            align: 'center',
            render: (url) => url ? (
                <Image 
                    src={url} 
                    width={50} 
                    height={50} 
                    style={{ objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 4, padding: 2 }} 
                />
            ) : 'No Logo'
        },
        { title: 'Tên Thương hiệu', dataIndex: 'name', width: 200, render: (text) => <b>{text}</b> },
        { title: 'Xuất xứ', dataIndex: 'origin' },
        {
            title: 'Hành động',
            align: 'center',
            width: 120,
            render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openModal(r)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Thương hiệu</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm mới</Button>
            </div>
            
            <Table 
                dataSource={brands} 
                columns={columns} 
                rowKey="id" 
                bordered 
                pagination={{ pageSize: 6 }}
            />
            
            <Modal 
                title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item name="name" label="Tên hãng" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="origin" label="Xuất xứ"><Input /></Form.Item>
                    {/* Thêm ô nhập Link Logo */}
                    <Form.Item name="logoUrl" label="Link Logo (URL ảnh)">
                        <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBrand;