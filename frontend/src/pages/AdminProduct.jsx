import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Space, InputNumber, Select, Typography } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AdminProduct = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // Biến lưu sản phẩm đang sửa
    const [form] = Form.useForm();

    const [searchText, setSearchText] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách!");
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // Hàm mở Modal để Sửa
    const handleEdit = (record) => {
        setEditingProduct(record); // Lưu lại sp đang sửa
        // Đổ dữ liệu cũ vào form
        form.setFieldsValue({
            ...record,
            file: null // Reset file input (vì ảnh cũ là link url, không phải file object)
        });
        setIsModalOpen(true);
    };

    // Hàm mở Modal để Thêm mới
    const handleAddNew = () => {
        setEditingProduct(null); // Xóa trạng thái sửa
        form.resetFields(); // Xóa trắng form
        setIsModalOpen(true);
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('price', values.price);
            formData.append('brand', values.brand);
            formData.append('cpu', values.cpu);
            formData.append('ram', values.ram);
            formData.append('storage', values.storage);
            formData.append('screen', values.screen);
            formData.append('description', values.description);
            
            // Nếu có chọn ảnh mới thì gửi lên, không thì thôi
            if (values.file && values.file.fileList.length > 0) {
                formData.append('file', values.file.fileList[0].originFileObj);
            }

            if (editingProduct) {
                // --- LOGIC SỬA (PUT) ---
                await api.put(`/products/update/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Cập nhật thành công!");
            } else {
                // --- LOGIC THÊM (POST) ---
                await api.post('/products/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Thêm mới thành công!");
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchProducts();
        } catch (error) {
            message.error("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xóa sản phẩm này?',
            onOk: async () => {
                try {
                    await api.delete(`/products/${id}`);
                    message.success("Đã xóa!");
                    fetchProducts();
                } catch (error) { message.error("Lỗi xóa!"); }
            }
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { 
            title: 'Ảnh', dataIndex: 'image',
            render: (img) => <img src={img} alt="laptop" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
        },
        { title: 'Tên Laptop', dataIndex: 'name' },
        { title: 'Giá', dataIndex: 'price', render: (p) => `${p?.toLocaleString()} đ` },
        { title: 'Hãng', dataIndex: 'brand' },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    {/* Nút Sửa màu xanh */}
                    <Button icon={<EditOutlined />} type="primary" ghost onClick={() => handleEdit(record)} />
                    {/* Nút Xóa màu đỏ */}
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Typography.Title level={2} style={{ margin: 0 }}>Quản lý sản phẩm</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} size="large">
                    Thêm sản phẩm mới
                </Button>
            </div>

            <Input.Search 
                placeholder="Tìm kiếm theo tên laptop..." 
                style={{ marginBottom: 16, maxWidth: 300 }} 
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)} // Tìm ngay khi gõ
            />

            <Table 
                columns={columns} 
                rowKey="id" 
                bordered
                // Cấu hình phân trang tại đây
                pagination={{ 
                    defaultPageSize: 5, // Mặc định hiển thị 5 dòng/trang
                    showSizeChanger: true, // Cho phép Admin chọn 5, 10, 20 dòng/trang
                    pageSizeOptions: ['5', '10', '20', '50'], // Các tùy chọn
                    showTotal: (total) => `Tổng cộng ${total} sản phẩm`, // Hiển thị tổng số
                    position: ['bottomRight'], // Vị trí nút phân trang
                }} 
                dataSource={products.filter(p => 
                    p.name.toLowerCase().includes(searchText.toLowerCase())
                )}
            />

            <Modal 
                title={editingProduct ? "Cập nhật Laptop" : "Thêm Laptop Mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleFinish} layout="vertical">
                    <Form.Item name="name" label="Tên Laptop" rules={[{ required: true }]}><Input /></Form.Item>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Form.Item name="price" label="Giá tiền" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                        <Form.Item name="brand" label="Hãng SX" rules={[{ required: true }]}>
                            <Select>
                                <Option value="Dell">Dell</Option>
                                <Option value="HP">HP</Option>
                                <Option value="Asus">Asus</Option>
                                <Option value="Macbook">Macbook</Option>
                                <Option value="Acer">Acer</Option>
                                <Option value="Lenovo">Lenovo</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Form.Item name="cpu" label="CPU" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="ram" label="RAM" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="storage" label="Ổ cứng" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="screen" label="Màn hình" rules={[{ required: true }]}><Input /></Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả"><TextArea rows={3} /></Form.Item>

                    <Form.Item name="file" label={editingProduct ? "Thay ảnh mới (Bỏ qua nếu giữ ảnh cũ)" : "Hình ảnh"}>
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            {editingProduct ? "Cập nhật" : "Lưu sản phẩm"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProduct;