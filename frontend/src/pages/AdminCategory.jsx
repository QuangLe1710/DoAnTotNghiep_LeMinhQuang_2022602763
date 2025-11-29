import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) { message.error("Lỗi tải dữ liệu"); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async (values) => {
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, values);
                message.success("Cập nhật thành công");
            } else {
                await api.post('/categories', values);
                message.success("Thêm mới thành công");
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) { message.error("Lỗi lưu dữ liệu"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa danh mục này?")) return;
        try {
            await api.delete(`/categories/${id}`);
            message.success("Đã xóa");
            fetchCategories();
        } catch (e) { message.error("Lỗi xóa"); }
    };

    const openModal = (record = null) => {
        setEditingCategory(record);
        form.setFieldsValue(record || { name: '', slug: '', description: '' });
        setIsModalOpen(true);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Tên Danh mục', dataIndex: 'name' },
        { title: 'Slug', dataIndex: 'slug' },
        { title: 'Mô tả', dataIndex: 'description' },
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
                <h2>Quản lý Danh mục</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm mới</Button>
            </div>
            <Table dataSource={categories} columns={columns} rowKey="id" bordered />
            
            <Modal title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="slug" label="Slug (VD: laptop-gaming)" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategory;