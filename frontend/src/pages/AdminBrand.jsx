import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
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
        form.setFieldsValue(record || { name: '', origin: '' });
        setIsModalOpen(true);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Tên Thương hiệu', dataIndex: 'name' },
        { title: 'Xuất xứ', dataIndex: 'origin' },
        {
            title: 'Hành động',
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
            <Table dataSource={brands} columns={columns} rowKey="id" bordered />
            
            <Modal title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item name="name" label="Tên hãng" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="origin" label="Xuất xứ"><Input /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBrand;